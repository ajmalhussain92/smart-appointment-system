const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'Not authorized' });

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const doctorOnly = (req, res, next) => {
  if (req.user.role !== 'doctor')
    return res.status(403).json({ message: 'Doctor access only' });
  next();
};

const patientOnly = (req, res, next) => {
  if (req.user.role !== 'patient')
    return res.status(403).json({ message: 'Patient access only' });
  next();
};

module.exports = { protect, doctorOnly, patientOnly };
