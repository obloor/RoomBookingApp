import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../constant';
import './Login.css'; // Reusing the same styles as login

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password2: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        
        // Basic validation
        if (formData.password !== formData.password2) {
            setMessage({ text: "Passwords don't match", type: 'error' });
            return;
        }

        setIsLoading(true);

        try {
            const _response = await axios.post(`${BaseUrl}/api/register/`, {
                username: formData.username.trim(),
                email: formData.email.trim(),
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                password: formData.password,
                password2: formData.password2
            });
            

            setMessage({ 
                text: 'Registration successful! Redirecting to login...', 
                type: 'success' 
            });
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Registration error details:', {
                message: error.message,
                response: error.response ? {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data
                } : 'No response',
                request: error.request ? 'Request was made but no response received' : 'No request was made'
            });
            
            let errorMessage = 'Registration failed. Please try again.';
            if (error.response) {
                // Handle validation errors from the server
                const errors = error.response.data;
        
                // Handle different types of error responses
                if (typeof errors === 'object') {
                    if (errors.username) {
                        errorMessage = Array.isArray(errors.username) 
                            ? `Username: ${errors.username[0]}`
                            : `Username: ${errors.username}`;
                    } else if (errors.email) {
                        errorMessage = Array.isArray(errors.email)
                            ? `Email: ${errors.email[0]}`
                            : `Email: ${errors.email}`;
                    } else if (errors.password) {
                        errorMessage = Array.isArray(errors.password)
                            ? `Password: ${errors.password[0]}`
                            : `Password: ${errors.password}`;
                    } else if (errors.non_field_errors) {
                        errorMessage = Array.isArray(errors.non_field_errors)
                            ? errors.non_field_errors[0]
                            : errors.non_field_errors;
                    } else if (error.response.status === 400) {
                        // Handle other 400 validation errors
                        const errorMessages = [];
                        for (const [field, messages] of Object.entries(errors)) {
                            if (Array.isArray(messages)) {
                                errorMessages.push(`${field}: ${messages[0]}`);
                            } else {
                                errorMessages.push(`${field}: ${messages}`);
                            }
                        }
                        errorMessage = errorMessages.join(', ');
                    }
                } else if (typeof errors === 'string') {
                    errorMessage = errors;
                }
            } else if (error.request) {
                errorMessage = 'No response from server. Please check your internet connection.';
            }
            
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Create an Account</h2>
                <p className="subtitle">Join us today to start your journey</p>
                
                {message.text && (
                    <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
                        {message.text}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username *</label>
                        <input
                            id="username"
                            type="text"
                            name="username"
                            className="form-control"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Choose a username"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="first_name">First Name</label>
                                <input
                                    id="first_name"
                                    type="text"
                                    name="first_name"
                                    className="form-control"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="First name"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="last_name">Last Name</label>
                                <input
                                    id="last_name"
                                    type="text"
                                    name="last_name"
                                    className="form-control"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Last name"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password2">Confirm Password *</label>
                        <input
                            id="password2"
                            type="password"
                            name="password2"
                            className="form-control"
                            value={formData.password2}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Creating Account...
                            </>
                        ) : 'Create Account'}
                    </button>
                    
                    <div className="text-center mt-3">
                        <span className="text-muted">Already have an account? </span>
                        <Link to="/login" className="register-link">Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;