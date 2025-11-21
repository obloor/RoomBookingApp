// Base URL for API requests
export const BaseUrl = "https://reservation-app-sepia.vercel.app";

// API Endpoints
export const API_ENDPOINTS = {
  ROOMS: {
    BASE: "/api/rooms/",
  },
  AUTH: {
    LOGIN: "/api/auth/jwt/create/",
    REFRESH: "/api/auth/jwt/refresh/",
    REGISTER: "/api/register/",
    ME: "/api/users/me/",
  }
};


// Meeting room features
export const ROOM_FEATURES = [
  'Projector',
  'Whiteboard',
  'Video Conferencing',
  'Teleconferencing',
  'Coffee Machine',
  'Catering Available',
  'Wheelchair Accessible',
];

export const ROOM_CAPACITIES = [
  { value: 2, label: '2 people' },
  { value: 4, label: '4 people' },
  { value: 6, label: '6 people' },
  { value: 8, label: '8 people' },
  { value: 10, label: '10+ people' },
];
