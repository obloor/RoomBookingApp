// Base URL for API requests
//export const BaseUrl = 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/jwt/create/',
    REFRESH: '/api/auth/jwt/refresh/',
    REGISTER: '/api/register/',
    ME: '/api/users/me/',
  },
  ROOMS: {
    BASE: '/api/rooms/',
    AVAILABILITY: '/api/rooms/availability/',
  },
  BOOKINGS: {
    BASE: '/api/reservations/',
    MY_BOOKINGS: '/api/reservations/my/',
  },
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

export default {
  BaseUrl,
  API_ENDPOINTS,
  ROOM_FEATURES,
  ROOM_CAPACITIES,
};
