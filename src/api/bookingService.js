import { api } from './api.jsx';
import { API_ENDPOINTS } from "./constant";

export const bookingService = {
  // Create a new reservation
  createBooking: async (bookingData) => {
    try {
      const response = await api.post(API_ENDPOINTS.RESERVATIONS.BASE, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  // Get all reservations for the current user
  getMyBookings: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.RESERVATIONS.BASE);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  // Update a reservation
  updateBooking: async (bookingId, updateData) => {
    try {
      const response = await api.patch(
        `${API_ENDPOINTS.RESERVATIONS.BASE}${bookingId}/`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  // Delete a reservation
  deleteBooking: async (bookingId) => {
    try {
      await api.delete(`${API_ENDPOINTS.RESERVATIONS.BASE}${bookingId}/`);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },

  // Check room availability (correct format)
  checkAvailability: async (roomId, startDate, endDate) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.ROOMS.BASE}${roomId}/availability/`, {
        params: {
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

export default bookingService;
