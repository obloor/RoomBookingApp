import axios from "axios";
import { BaseUrl, API_ENDPOINTS } from "./constant";

export const api = axios.create({
  baseURL: BaseUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refresh = localStorage.getItem("refresh_token");
        const { data } = await axios.post(
          `${BaseUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refresh }
        );

        localStorage.setItem("token", data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default {
  // Auth
  login: (username, password) =>
    api.post(API_ENDPOINTS.AUTH.LOGIN, { username, password }),

  // Rooms
  getAllRooms: () => api.get(API_ENDPOINTS.ROOMS.BASE),
  getRoom: (id) => api.get(`${API_ENDPOINTS.ROOMS.BASE}${id}/`),

  // Reservations
  getReservations: () => api.get(API_ENDPOINTS.RESERVATIONS.BASE),
  createReservation: (data) => api.post(API_ENDPOINTS.RESERVATIONS.BASE, data),
  deleteReservation: (id) =>
    api.delete(`${API_ENDPOINTS.RESERVATIONS.BASE}${id}/`),
  getReservation: (id) =>
    api.get(`${API_ENDPOINTS.RESERVATIONS.BASE}${id}/`),
  updateReservation: (id, data) =>
    api.patch(`${API_ENDPOINTS.RESERVATIONS.BASE}${id}/`, data),
};
