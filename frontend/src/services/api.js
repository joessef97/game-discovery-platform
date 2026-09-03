import axios from 'axios';

// In production the API is served from the same origin (Vercel routes /api/*
// to the serverless function), so a relative base URL avoids any CORS setup.
// REACT_APP_API_URL still overrides it if the API is hosted separately.
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gamehub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors and timeouts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('gamehub_token');
      window.location.href = '/login';
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server may be overloaded');
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - check if backend server is running');
    }
    
    return Promise.reject(error);
  }
);

export default api;
