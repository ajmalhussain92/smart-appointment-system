const User = require('../models/User');
const Appointment = require('../models/Appointment');

const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.isAvailable = !user.isAvailable;
    await user.save();
    res.json({ isAvailable: user.isAvailable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDoctorStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await Appointment.find({ doctor: req.user._id, date: today });

    const total = appointments.length;
    const waiting = appointments.filter((a) => a.status === 'waiting').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    const utilization = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ total, waiting, completed, cancelled, utilization });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDoctors, toggleAvailability, getDoctorStats };
