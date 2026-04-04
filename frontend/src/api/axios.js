import axios from 'axios';

// Get API URL from environment or detect from current host
const getAPIURL = () => {
  // If env var is set, use it
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  
  // If running on localhost, use localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // Otherwise use current host with port 5000
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:5000/api`;
};

const API_URL = getAPIURL();
console.log('🌐 API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
    console.log('📤 Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const errorMsg = error.response?.data?.message || error.message;
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: errorMsg,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
