import axios from 'axios';
import API_BASE_URL from './apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Don't add Authorization header for public auth endpoints
      const publicEndpoints = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/refresh-token'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
      
      if (!isPublicEndpoint) {
        const token = localStorage.getItem('token');
        const sessionToken = localStorage.getItem('sessionToken');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (sessionToken) {
          config.headers['X-Session-Token'] = sessionToken;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Unauthorized (invalid/expired token)
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('sessionToken');
        window.location.href = '/login';
      }
    }
    
    // Don't modify the error - let components handle user-friendly messages
    // via the errorHandler utility
    return Promise.reject(error);
  }
);

export default api;
