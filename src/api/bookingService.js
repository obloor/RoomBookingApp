import axios from 'axios';
import { BaseUrl } from '../constant';

// Create one API client just for authenticated booking endpoints
const api = axios.create({
  baseURL: `${BaseUrl}/api`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach access token before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Only attach if it's a real token
  if (token && token.trim() !== "" && token !== "null" && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // If token doesn't exist, remove header completely
    delete config.headers.Authorization;
  }

  return config;
});


// Create a new reservation
const createBooking = async (data) => {
  const res = await api.post('/reservations/', data);
  return res.data;
};

// All reservations for current logged-in user
const getBookings = async () => {
  const res = await api.get('/reservations/');
  return res.data;
};

// Fetch a single reservation by ID
const getBooking = async (id) => {
  const res = await api.get(`/reservations/${id}/`);
  return res.data;
};

// Update a reservation (PATCH = partial update)
const updateBooking = async (id, data) => {
  const res = await api.patch(`/reservations/${id}/`, data);
  return res.data;
};

// Delete a specific reservation
const deleteBooking = async (id) => {
  const res = await api.delete(`/reservations/${id}/`);
  return res.data;
};

export default {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
};
