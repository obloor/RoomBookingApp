import axios from 'axios';
import { BaseUrl } from '../constant';

const API_URL = `${BaseUrl}/api/reservations/`;

const api = axios.create({
  baseURL: BaseUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      const response = await axios.post(`${BaseUrl}/api/auth/jwt/refresh/`, {
        refresh: refreshToken,
      });

      const { access } = response.data;

      localStorage.setItem('token', access);

      originalRequest.headers.Authorization = `Bearer ${access}`;

      return api(originalRequest);
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);


const createBooking = async (bookingData) => {
  const response = await api.post('/api/reservations/', bookingData);
  return response.data;
};

const getBookings = async () => {
  const response = await api.get('/api/reservations/');
  return response.data;
};

const deleteBooking = async (id) => {
  const response = await api.delete(`/api/reservations/${id}/`);
  return response.data;
};

export default {
  createBooking,
  getBookings,
  deleteBooking,
};
