import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const appointmentAPI = {
  getSlots: (doctorId, date) =>
    api.get('/appointments/slots', { params: { doctorId, date } }),
  book: (data) => api.post('/appointments', data),
  getMy: () => api.get('/appointments/my'),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
  getWaitingTime: (doctorId, date) =>
    api.get('/appointments/waiting-time', { params: { doctorId, date } }),
  markNoShow: (id) => api.patch(`/appointments/${id}/no-show`),
};

export const doctorAPI = {
  getAll: () => api.get('/doctors'),
  toggleAvailability: () => api.patch('/doctors/availability'),
  getStats: () => api.get('/doctors/stats'),
};
