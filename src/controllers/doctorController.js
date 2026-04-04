const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { emitAvailabilityUpdate } = require('../services/socketService');

const getDoctors = async (req, res) => {
  try {
    const { specialization, available, type } = req.query;
    const filter = { role: 'doctor' };

    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
    if (available === 'true') filter.isAvailable = true;
    if (type) filter.consultationType = type;

    const doctors = await User.find(filter).select('-password -resetOtp -resetOtpExpiry');
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
    emitAvailabilityUpdate(user._id, user.isAvailable);
    res.json({ isAvailable: user.isAvailable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const setOffDays = async (req, res) => {
  const { offDays } = req.body;
  if (!Array.isArray(offDays))
    return res.status(400).json({ message: 'offDays must be an array of dates' });

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { offDays },
      { new: true }
    ).select('-password');
    res.json({ offDays: user.offDays });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const setConsultationType = async (req, res) => {
  const { consultationType } = req.body;
  if (!Array.isArray(consultationType) ||
      !consultationType.every((t) => ['in-person', 'online'].includes(t)))
    return res.status(400).json({ message: 'consultationType must be array of in-person or online' });

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { consultationType },
      { new: true }
    ).select('-password');
    res.json({ consultationType: user.consultationType });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDoctorStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await Appointment.find({ doctor: req.user._id, date: today });

    const total     = appointments.length;
    const pending   = appointments.filter((a) => a.status === 'pending').length;
    const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
    const inProgress= appointments.filter((a) => a.status === 'in-progress').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    const noShow    = appointments.filter((a) => a.status === 'no-show').length;
    const utilization = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ total, pending, confirmed, inProgress, completed, cancelled, noShow, utilization });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDoctors, toggleAvailability, setOffDays, setConsultationType, getDoctorStats };
