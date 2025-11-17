import axios from 'axios';
import { BaseUrl } from '../constant';

const api = axios.create({
  baseURL: BaseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && token !== "null" && token !== "undefined" && token.trim() !== "") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default {
  getAllRooms: async () => {
    const res = await api.get('/api/rooms/');
    return res.data;
  },

  getRoom: async (id) => {
    const res = await api.get(`/api/rooms/${id}/`);
    return res.data;
  },

  createReservation: async (data) => {
    const res = await api.post('/api/reservations/', data);
    return res.data;
  },

  deleteReservation: async (id) => {
    const res = await api.delete(`/api/reservations/${id}/`);
    return res.data;
  },

    getReservation: async (id) => {
  const res = await api.get(`/api/reservations/${id}/`);
  return res.data;
},

updateReservation: async (id, data) => {
  const res = await api.patch(`/api/reservations/${id}/`, data);
  return res.data;
},

  getUserReservations: async () => {
    const res = await api.get(`/api/reservations/`);
    return res.data;
  }
};
