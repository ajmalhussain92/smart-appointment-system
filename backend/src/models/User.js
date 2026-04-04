const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'] },
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'] },
  role: { type: String, enum: ['doctor', 'patient'], required: [true, 'Role is required'] },
  specialization: { type: String, trim: true },
  isAvailable:    { type: Boolean, default: true },
  offDays:         { type: [String], default: [] }, // ['2025-07-20', '2025-07-21']
  consultationType:{ type: [String], enum: ['in-person', 'online'], default: ['in-person'] },
  resetOtp:        { type: String },
  resetOtpExpiry:  { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
