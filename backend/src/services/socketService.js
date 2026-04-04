let _io = null;

const init = (io) => {
  _io = io;

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join doctor queue room
    socket.on('join-queue', ({ doctorId } = {}) => {
      if (!doctorId) return;
      socket.join(`queue-${doctorId}`);
      console.log(`📍 Socket ${socket.id} joined queue: ${doctorId}`);
    });

    // Leave doctor queue room
    socket.on('leave-queue', ({ doctorId } = {}) => {
      if (!doctorId) return;
      socket.leave(`queue-${doctorId}`);
      console.log(`📍 Socket ${socket.id} left queue: ${doctorId}`);
    });

    // Join availability updates room (for all clients)
    socket.on('watch-availability', () => {
      socket.join('availability-updates');
      console.log(`👁️ Socket ${socket.id} watching availability updates`);
    });

    // Leave availability updates room
    socket.on('unwatch-availability', () => {
      socket.leave('availability-updates');
      console.log(`👁️ Socket ${socket.id} stopped watching availability`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

const emitQueueUpdate = (doctorId, data = {}) => {
  if (!_io || !doctorId) return;
  _io.to(`queue-${doctorId}`).emit('queue-updated', data);
  console.log(`📤 Queue update for doctor ${doctorId}`);
};

const emitNewBooking = (doctorId, appointment) => {
  if (!_io || !doctorId) return;
  _io.to(`queue-${doctorId}`).emit('new-booking', appointment);
  console.log(`📤 New booking for doctor ${doctorId}`);
};

const emitAvailabilityUpdate = (doctorId, isAvailable) => {
  if (!_io || !doctorId) return;
  // Broadcast to all clients watching availability
  _io.to('availability-updates').emit('doctor-availability-changed', { 
    doctorId: doctorId.toString(), 
    isAvailable,
    timestamp: new Date().toISOString(),
  });
  console.log(`🟢 Doctor ${doctorId} availability: ${isAvailable}`);
};

const broadcastDoctorsList = (doctors) => {
  if (!_io) return;
  _io.to('availability-updates').emit('doctors-list-updated', doctors);
  console.log(`📤 Doctors list broadcasted to ${_io.engine.clientsCount} clients`);
};

module.exports = { init, emitQueueUpdate, emitNewBooking, emitAvailabilityUpdate, broadcastDoctorsList };
