import axios from 'axios';
import { BaseUrl } from '../constant';

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

// All API calls grouped here
export default {
  // List all rooms
  getAllRooms: async () => {
    const res = await api.get('/api/rooms/');
    return res.data;
  },

  // Single room details
  getRoom: async (id) => {
    const res = await api.get(`/api/rooms/${id}/`);
    return res.data;
  },

  // Create reservation
  createReservation: async (data) => {
    const res = await api.post('/api/reservations/', data);
    return res.data;
  },

  // Delete reservation
  deleteReservation: async (id) => {
    const res = await api.delete(`/api/reservations/${id}/`);
    return res.data;
  },

  // Get one reservation
  getReservation: async (id) => {
    const res = await api.get(`/api/reservations/${id}/`);
    return res.data;
  },

  // Update reservation
  updateReservation: async (id, data) => {
    const res = await api.patch(`/api/reservations/${id}/`, data);
    return res.data;
  },

  // All reservations for current user
  getUserReservations: async () => {
    const res = await api.get(`/api/reservations/`);
    return res.data;
  }
};
