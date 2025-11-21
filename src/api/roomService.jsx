import axios from 'axios';
import { BaseUrl, API_ENDPOINTS } from './constant';

// Main API config
const api = axios.create({
  baseURL: BaseUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach the JWT access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Filter out empty or invalid tokens
  if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default {
  // List all rooms
  getAllRooms: async () => {
    const res = await api.get('/rooms/');  // Removed /api
    return res.data;
  },

  // Single room details
  getRoom: async (id) => {
    const res = await api.get(`/rooms/${id}/`);  // Removed /api
    return res.data;
  },

  // Create reservation
  createReservation: async (data) => {
    const res = await api.post('/reservations/', data);  // Removed /api
    return res.data;
  },

  // Delete reservation
  deleteReservation: async (id) => {
    const res = await api.delete(`/reservations/${id}/`);  // Removed /api
    return res.data;
  },

  // Get one reservation
  getReservation: async (id) => {
    const res = await api.get(`/reservations/${id}/`);  // Removed /api
    return res.data;
  },

  // Update reservation
  updateReservation: async (id, data) => {
    const res = await api.patch(`/reservations/${id}/`, data);  // Removed /api
    return res.data;
  },

  // All reservations for current user
  getUserReservations: async () => {
    const res = await api.get(`/reservations/`);  // Removed /api
    return res.data;
  }
};