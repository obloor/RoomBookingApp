// src/api/roomService.js
import axios from 'axios';
import { BaseUrl } from '../constants';

const api = axios.create({
  baseURL: BaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const response = await axios.post(`${BaseUrl}/api/auth/jwt/refresh/`, { refresh });
        const { access } = response.data;
        localStorage.setItem('token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default {
  // Auth
  login: (username, password) =>
    api.post('/api/auth/jwt/create/', { username, password }),

  // Rooms
  getAllRooms: () => api.get('/api/rooms/'),
  getRoom: (id) => api.get(`/api/rooms/${id}/`),
  checkAvailability: (roomId, startDate, endDate) =>
    api.get(`/api/rooms/${roomId}/availability/`, {
      params: { start_date: startDate, end_date: endDate }
    }),

  // Reservations
  getReservations: () => api.get('/api/reservations/'),
  createReservation: (data) => api.post('/api/reservations/', data),
  deleteReservation: (id) => api.delete(`/api/reservations/${id}/`),
};