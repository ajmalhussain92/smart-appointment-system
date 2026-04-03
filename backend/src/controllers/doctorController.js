const User = require('../models/User');

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
    const doctor = await User.findById(req.user._id);
    doctor.isAvailable = !doctor.isAvailable;
    await doctor.save();
    res.json({ isAvailable: doctor.isAvailable });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDoctors, toggleAvailability };
