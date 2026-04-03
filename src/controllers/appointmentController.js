const Appointment = require('../models/Appointment');

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const getSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date)
    return res.status(400).json({ message: 'doctorId and date are required' });

  try {
    const booked = await Appointment.find({
      doctor: doctorId, date, status: { $ne: 'cancelled' },
    }).select('timeSlot');

    const bookedSlots = booked.map((a) => a.timeSlot);
    res.json({
      available: TIME_SLOTS.filter((s) => !bookedSlots.includes(s)),
      booked: bookedSlots,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot } = req.body;
  try {
    const waitingCount = await Appointment.countDocuments({
      doctor: doctorId, date, status: 'waiting',
    });

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      timeSlot,
      queuePosition: waitingCount + 1,
    });

    await appointment.populate('doctor', 'name specialization');
    res.status(201).json(appointment);
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'This slot is already booked' });
    res.status(500).json({ message: err.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const filter = req.user.role === 'doctor'
      ? { doctor: req.user._id }
      : { patient: req.user._id };

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
  const { status } = req.body;
  if (!['completed', 'cancelled'].includes(status))
    return res.status(400).json({ message: 'Invalid status' });

  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id },
      { status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
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
    const waitingCount = await Appointment.countDocuments({ doctor: doctorId, date, status: 'waiting' });
    res.json({ waitingCount, estimatedMinutes: waitingCount * 15, avgConsultationMinutes: 15 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSlots, bookAppointment, getMyAppointments, updateStatus, cancelAppointment, markNoShow, getWaitingTime };
