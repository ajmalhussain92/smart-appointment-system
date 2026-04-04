const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { emitQueueUpdate, emitNewBooking } = require('../services/socketService');

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

// Helper: convert "09:00 AM" to minutes since midnight
const slotToMinutes = (slot) => {
  const [time, period] = slot.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

const getSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date)
    return res.status(400).json({ message: 'doctorId and date are required' });

  // Block past dates
  const today = new Date().toISOString().split('T')[0];
  if (date < today)
    return res.status(400).json({ message: 'Cannot book appointments for past dates' });

  try {
    // Check if doctor has this day off
    const doctor = await User.findById(doctorId).select('offDays isAvailable consultationType');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const isOffDay = doctor.offDays.includes(date);
    // On off-day, only return slots if doctor supports online
    if (isOffDay && !doctor.consultationType.includes('online'))
      return res.status(400).json({ message: 'Doctor is not available on this date' });

    const booked = await Appointment.find({
      doctor: doctorId, date, status: { $ne: 'cancelled' },
    }).select('timeSlot');

    const bookedSlots = booked.map((a) => a.timeSlot);

    // If today, filter out past time slots
    let availableSlots = TIME_SLOTS.filter((s) => !bookedSlots.includes(s));
    if (date === today) {
      const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
      availableSlots = availableSlots.filter((s) => slotToMinutes(s) > nowMinutes);
    }

    res.json({ available: availableSlots, booked: bookedSlots, isOffDay });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot, type = 'in-person' } = req.body;

  // Block past dates
  const today = new Date().toISOString().split('T')[0];
  if (date < today)
    return res.status(400).json({ message: 'Cannot book appointments for past dates' });

  // Block past time slots for today
  if (date === today) {
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    if (slotToMinutes(timeSlot) <= nowMinutes)
      return res.status(400).json({ message: 'Cannot book a past time slot' });
  }

  try {
  // Check doctor off day — allow online only
    const doctor = await User.findById(doctorId).select('offDays consultationType');
    if (doctor?.offDays.includes(date)) {
      if (type !== 'online')
        return res.status(400).json({ message: 'Doctor is off today. Only online appointments are available.' });
      if (!doctor.consultationType.includes('online'))
        return res.status(400).json({ message: 'Doctor is not available on this date' });
    }

    const waitingCount = await Appointment.countDocuments({
      doctor: doctorId, date, status: { $in: ['pending', 'confirmed', 'in-progress'] },
    });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      timeSlot,
      type,
      status: 'pending',
      queuePosition: waitingCount + 1,
    });

    await appointment.populate('doctor', 'name specialization');
    await appointment.populate('patient', 'name email');
    emitNewBooking(doctorId, appointment);
    res.status(201).json(appointment);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'This slot is already booked' });
    res.status(500).json({ message: err.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const { status, type, date, showPast } = req.query;
    const filter = req.user.role === 'doctor'
      ? { doctor: req.user._id }
      : { patient: req.user._id };

    // Filters
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (date) filter.date = date;

    // Patient: only future appointments by default (unless showPast=true)
    if (req.user.role === 'patient' && !date && showPast !== 'true') {
      const today = new Date().toISOString().split('T')[0];
      filter.date = { $gte: today };
    }

    // Doctor: count waiting = pending + confirmed + in-progress
    const appointments = await Appointment.find(filter)
      .populate('doctor', 'name specialization')
      .populate('patient', 'name email')
      .sort({ date: 1, queuePosition: 1 });

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateStatus = async (req, res) => {
  const { status, notes, medicines } = req.body;
  const validStatuses = ['confirmed', 'in-progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });

  try {
    const update = { status };
    if (notes !== undefined) update.notes = notes;
    if (medicines !== undefined) update.medicines = medicines;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id },
      update,
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    emitQueueUpdate(appointment.doctor.toString(), { appointmentId: appointment._id, status });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    emitQueueUpdate(appointment.doctor.toString(), { appointmentId: appointment._id, status: 'cancelled' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markNoShow = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id },
      { status: 'no-show' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    emitQueueUpdate(appointment.doctor.toString(), { appointmentId: appointment._id, status: 'no-show' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getWaitingTime = async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date)
    return res.status(400).json({ message: 'doctorId and date are required' });

  try {
    const waitingCount = await Appointment.countDocuments({ doctor: doctorId, date, status: { $in: ['pending', 'confirmed', 'in-progress'] } });
    res.json({ waitingCount, estimatedMinutes: waitingCount * 15, avgConsultationMinutes: 15 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSlots, bookAppointment, getMyAppointments,
  updateStatus, cancelAppointment, markNoShow, getWaitingTime,
};
