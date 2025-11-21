import { api } from './api.jsx';
import { API_ENDPOINTS } from "./constant";

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
