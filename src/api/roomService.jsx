import { api } from './api';
import { API_ENDPOINTS } from './constant';

export const roomService = {
  getAllRooms: async () => {
    const res = await api.get(API_ENDPOINTS.ROOMS.BASE);
    return res.data;
  },

  // Single room details
  getRoom: async (id) => {
    const res = await api.get(`${API_ENDPOINTS.ROOMS.BASE}${id}/`);
    return res.data;
  },

  // Create reservation
  createReservation: async (data) => {
    const res = await api.post(API_ENDPOINTS.RESERVATIONS.BASE, data);
    return res.data;
  },

  // Delete reservation
  deleteReservation: async (id) => {
    const res = await api.delete(`${API_ENDPOINTS.RESERVATIONS.BASE}${id}/`);
    return res.data;
  },

  // Get one reservation
  getReservation: async (id) => {
    const res = await api.get(`${API_ENDPOINTS.RESERVATIONS.BASE}${id}/`);
    return res.data;
  },

  // Update reservation
  updateReservation: async (id, data) => {
    const res = await api.patch(`${API_ENDPOINTS.RESERVATIONS.BASE}${id}/`, data);
    return res.data;
  },

  // All reservations for current user
  getUserReservations: async () => {
    const res = await api.get(API_ENDPOINTS.RESERVATIONS.BASE);
    return res.data;
  }
};

export default roomService;