import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.56.237.210:5000/api',
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

export default api;
