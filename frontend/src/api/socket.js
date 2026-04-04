import { io } from 'socket.io-client';

const SOCKET_URL = 'http://10.56.237.210:5000';
let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });
  socket.on('connect', () => console.log('Socket connected:', socket.id));
  socket.on('disconnect', () => console.log('Socket disconnected'));
  socket.on('connect_error', (err) => console.warn('Socket error:', err.message));
  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
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
