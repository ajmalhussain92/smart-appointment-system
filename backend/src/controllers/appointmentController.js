const Appointment = require('../models/Appointment');

// Book appointment with FIFO queue position
const bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot } = req.body;
  try {
    const conflict = await Appointment.findOne({ doctor: doctorId, date, timeSlot });
    if (conflict) return res.status(409).json({ message: 'Time slot already booked' });

    // Queue position = count of waiting appointments for this doctor today + 1
    const queuePosition =
      (await Appointment.countDocuments({
        doctor: doctorId,
        date,
        status: 'waiting',
      })) + 1;

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      timeSlot,
      queuePosition,
    });

    await appointment.populate('doctor', 'name specialization');
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get appointments for logged-in user (patient or doctor)
const getMyAppointments = async (req, res) => {
  try {
    const filter =
      req.user.role === 'doctor'
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

// Update appointment status (doctor only)
const updateStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Not found' });

    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel appointment (patient)
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get available slots for a doctor on a date
const getAvailableSlots = async (req, res) => {
  const { doctorId, date } = req.query;
  const ALL_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];
  try {
    const booked = await Appointment.find({
      doctor: doctorId,
      date,
      status: { $ne: 'cancelled' },
    }).select('timeSlot');

    const bookedSlots = booked.map((a) => a.timeSlot);
    const available = ALL_SLOTS.filter((s) => !bookedSlots.includes(s));
    res.json({ available, booked: bookedSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  updateStatus,
  cancelAppointment,
  getAvailableSlots,
};
