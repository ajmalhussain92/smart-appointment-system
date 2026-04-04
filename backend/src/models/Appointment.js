const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:          { type: String, required: true },
  timeSlot:      { type: String, required: true },
  type:          { type: String, enum: ['in-person', 'online'], default: 'in-person' },
  status:        { type: String, enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'], default: 'pending' },
  queuePosition: { type: Number, required: true },
  notes:         { type: String, default: '' },
  medicines:     { type: String, default: '' },
  reminderSent:  { type: Boolean, default: false },
}, { timestamps: true });

appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
