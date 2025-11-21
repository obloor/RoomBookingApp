import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

import { BaseUrl } from "../api/constant.jsx";


export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch current user data ---
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Set the authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Try to get user data from localStorage first
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (e) {
        console.warn('Failed to parse stored user data:', e);
      }
    }

    try {
      // Try to fetch fresh user data from the server
      const response = await axios.get(`${BaseUrl}${API_ENDPOINTS.AUTH.ME}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Don't throw on HTTP error status codes
        validateStatus: status => status < 500
      });

      // If we got a successful response, use it
      if (response.status === 200 && response.data) {
        const userData = response.data;
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      }

      // If we get here, the user endpoint failed but we still have a valid token
      console.warn('User profile endpoint failed, continuing with minimal auth', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      // Create a minimal user object from the token
      // This is a fallback - the token might contain some basic user info
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const minimalUser = {
            id: payload.user_id,
            username: payload.username || 'user',
            email: payload.email || '',
            is_staff: payload.is_staff || false
          };
          setCurrentUser(minimalUser);
          localStorage.setItem('user', JSON.stringify(minimalUser));
          return minimalUser;
        } catch (e) {
          console.error('Failed to parse token:', e);
        }
      }


      throw new Error('Unable to determine user from token');

    } catch (err) {
      console.error('Error in fetchUserData:', {
        error: err,
        status: err.response?.status,
        data: err.response?.data
      });
      
      // Don't clear tokens on 500 errors - the auth might still be valid
      if (err.response?.status === 401) {
        console.warn('Authentication failed - clearing tokens');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        delete axios.defaults.headers.common['Authorization'];
      }
      
      // If we have a stored user, return that instead of failing
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {
          console.warn('Failed to use stored user data:', e);
        }
      }
      
      throw err;
    }
  }, []);

  // --- Initialize authentication on app load ---
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      // Restore user from localStorage immediately
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }

      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          await fetchUserData();
        } catch  {
          console.warn('Token invalid or expired — logging out.');
          logout();
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, [fetchUserData]);

  // Login
  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);

      const loginUrl = `${BaseUrl}${API_ENDPOINTS.AUTH.LOGIN}`;
      const response = await axios.post(loginUrl, { username, password });
      
      if (!response?.data?.access || !response?.data?.refresh) {
        throw new Error('Invalid response from server: Missing authentication tokens');
      }

      const { access, refresh } = response.data;
      
      // Store tokens
      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      // Fetch and set user data
      try {
        const userData = await fetchUserData();
        setCurrentUser(userData);
        
        // Redirect user
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
        
        return { success: true };
      } catch (userDataError) {
          throw new Error('Login successful but failed to load user profile');
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err.response) {
        // Server responded with error status (4xx, 5xx)
        
        // Handle specific error statuses
        if (err.response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data) {
          errorMessage = typeof err.response.data === 'string' 
            ? err.response.data 
            : JSON.stringify(err.response.data);
        }
      } else if (err.request) {
        // Request was made but no response received
          errorMessage = 'No response from server. Please check your connection.';
      } else if (err.message) {
        // Something else happened
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // --- Register ---
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      // Remove any leading slashes from the endpoint to prevent double slashes
      const registerEndpoint = API_ENDPOINTS.AUTH.REGISTER.replace(/^\/+/, '');
      const registerUrl = `${BaseUrl}/${registerEndpoint}`;
      
      const response = await axios.post(registerUrl, userData);
      
      if (response.status >= 200 && response.status < 300) {
        return { success: true };
      } else {
        throw new Error('Registration failed with status: ' + response.status);
      }
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors.join(' ');
        } else if (typeof err.response.data === 'object') {
          // Handle field-specific errors (e.g., username taken, password too common, etc.)
          const fieldErrors = Object.entries(err.response.data)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(' ') : errors}`)
            .join('\n');
          errorMessage = fieldErrors || errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  // --- Logout ---
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    navigate('/login');
  }, [navigate]);

  // --- Helper methods ---
  const isAuthenticated = useCallback(() => !!currentUser, [currentUser]);
  const isAdmin = useCallback(() => currentUser?.is_staff || false, [currentUser]);

  // --- Context value ---
  const value = {
    user: currentUser,             // ✅ for Navbar.jsx compatibility
    currentUser,
    isAuthenticated,
    isAdmin,
    error,
    loading,
    login,
    register,
    logout,
    fetchUserData,
  };

  // --- Loader while initializing auth ---
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '50vh' }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
