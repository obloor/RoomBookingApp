import { api } from './api';
import { API_ENDPOINTS } from './constant';

// Create one API client just for authenticated booking endpoints
// const api = axios.create({
//   baseURL: `${BaseUrl}/api`,
//   headers: {
//     'Content-Type': 'application/json',
//     Accept: 'application/json',
//   },
// });

// Attach access token before every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");

//   if (token && token.trim() !== "" && token !== "null" && token !== "undefined") {
//     config.headers.Authorization = `Bearer ${token}`;
//   } else {
//     delete config.headers.Authorization;
//   }

//   return config;
// });


// Create a new reservation
// const createBooking = async (data) => {
//   const res = await api.post('/reservations/', data);
//   return res.data;
// };

// All reservations for current logged-in user
// const getBookings = async () => {
//   const res = await api.get('/reservations/');
//   return res.data;
// };

// Fetch a single reservation by ID
// const getBooking = async (id) => {
//   const res = await api.get(`/reservations/${id}/`);
//   return res.data;
// };

// Update a reservation
// const updateBooking = async (id, data) => {
//   const res = await api.patch(`/reservations/${id}/`, data);
//   return res.data;
// };

// Delete a specific reservation
// const deleteBooking = async (id) => {
//   const res = await api.delete(`/reservations/${id}/`);
//   return res.data;
// };

export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post(API_ENDPOINTS.BOOKINGS.BASE, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Get all bookings for the current user
  getMyBookings: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Update a booking
  updateBooking: async (bookingId, updateData) => {
    try {
      const response = await api.put(
        `${API_ENDPOINTS.BOOKINGS.BASE}${bookingId}/`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  // Delete a booking
  deleteBooking: async (bookingId) => {
    try {
      await api.delete(`${API_ENDPOINTS.BOOKINGS.BASE}${bookingId}/`);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },

  // Check room availability
  checkAvailability: async (roomId, startDate, endDate) => {
    try {
      const response = await api.get(API_ENDPOINTS.ROOMS.AVAILABILITY, {
        params: {
          room: roomId,
          start_date: startDate,
          end_date: endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  },
};
