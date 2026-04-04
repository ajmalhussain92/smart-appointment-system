import { io } from 'socket.io-client';

let socket = null;

const getSocketURL = () => {
  // Use same host as frontend
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
  const hostname = window.location.hostname;
  return `${protocol}://${hostname}:5000`;
};

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  
  const SOCKET_URL = getSocketURL();
  console.log('🔌 Connecting to socket:', SOCKET_URL);
  
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });
  
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    // Watch availability updates
    socket.emit('watch-availability');
  });
  
  socket.on('disconnect', () => console.log('❌ Socket disconnected'));
  socket.on('connect_error', (err) => console.warn('⚠️ Socket error:', err.message));
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) { 
    socket.emit('unwatch-availability');
    socket.disconnect(); 
    socket = null; 
  }
};

export const getSocket = () => socket;

export const joinQueue = (doctorId) => {
  if (!socket) return;
  socket.emit('join-queue', { doctorId });
};

export const leaveQueue = (doctorId) => {
  if (!socket) return;
  socket.emit('leave-queue', { doctorId });
};

export const subscribeToQueue = (doctorId, onUpdate) => {
  if (!socket) return;
  socket.emit('join-queue', { doctorId });
  socket.on('queue-updated', onUpdate);
  socket.on('new-booking', onUpdate);
};

export const unsubscribeFromQueue = () => {
  if (!socket) return;
  socket.off('queue-updated');
  socket.off('new-booking');
};

// New: Listen to availability changes
export const onAvailabilityChange = (callback) => {
  if (!socket) return;
  socket.on('doctor-availability-changed', callback);
};

export const offAvailabilityChange = () => {
  if (!socket) return;
  socket.off('doctor-availability-changed');
};

// New: Listen to doctors list updates
export const onDoctorsListUpdate = (callback) => {
  if (!socket) return;
  socket.on('doctors-list-updated', callback);
};

export const offDoctorsListUpdate = () => {
  if (!socket) return;
  socket.off('doctors-list-updated');
};
