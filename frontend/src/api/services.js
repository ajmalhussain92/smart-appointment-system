import api from './axios';

export const authAPI = {
  register:        (data)               => api.post('/auth/register', data),
  login:           (data)               => api.post('/auth/login', data),
  logout:          ()                   => api.post('/auth/logout'),
  forgotPassword:  (email)              => api.post('/auth/forgot-password', { email }),
  resetPassword:   (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword }),
};

export const appointmentAPI = {
  getSlots:      (doctorId, date)       => api.get('/appointments/slots', { params: { doctorId, date } }),
  getWaitingTime:(doctorId, date)       => api.get('/appointments/waiting-time', { params: { doctorId, date } }),
  getMy:         (filters = {})         => api.get('/appointments/my', { params: filters }),
  book:          (data)                 => api.post('/appointments', data),
  updateStatus:  (id, status, notes, medicines) => api.patch(`/appointments/${id}/status`, { status, notes, medicines }),
  cancel:        (id)                   => api.patch(`/appointments/${id}/cancel`),
  markNoShow:    (id)                   => api.patch(`/appointments/${id}/no-show`),
};

export const doctorAPI = {
  getAll:              (filters = {})   => api.get('/doctors', { params: filters }),
  getStats:            ()               => api.get('/doctors/stats'),
  getRankings:         ()               => api.get('/doctors/rankings'),
  toggleAvailability:  ()               => api.patch('/doctors/availability'),
  setOffDays:          (offDays)        => api.patch('/doctors/off-days', { offDays }),
  setConsultationType: (types)          => api.patch('/doctors/consultation-type', { consultationType: types }),
};
