import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach token and security headers to every request
api.interceptors.request.use(
  (config) => {
    // JWT auth token
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // API security headers — read strictly from env vars (no insecure fallbacks)
    const apiKey = import.meta.env.VITE_API_KEY;
    const appKey = import.meta.env.VITE_APP_KEY;

    if (apiKey) config.headers['x-api-key'] = apiKey;
    if (appKey) config.headers['x-app-key'] = appKey;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth store and redirect to login if unauthorized
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
