let _io = null;

const init = (io) => {
  _io = io;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-queue', ({ doctorId } = {}) => {
      if (!doctorId) return;
      socket.join(doctorId);
      console.log(`Socket ${socket.id} joined queue: ${doctorId}`);
    });

    socket.on('leave-queue', ({ doctorId } = {}) => {
      if (!doctorId) return;
      socket.leave(doctorId);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const emitQueueUpdate = (doctorId, data = {}) => {
  if (!_io || !doctorId) return;
  _io.to(doctorId.toString()).emit('queue-updated', data);
};

const emitNewBooking = (doctorId, appointment) => {
  if (!_io || !doctorId) return;
  _io.to(doctorId.toString()).emit('new-booking', appointment);
};

const emitAvailabilityUpdate = (doctorId, isAvailable) => {
  if (!_io || !doctorId) return;
  _io.emit('doctor-availability-updated', { doctorId: doctorId.toString(), isAvailable });
};

module.exports = { init, emitQueueUpdate, emitNewBooking, emitAvailabilityUpdate };
