const express = require('express');
const {
  bookAppointment,
  getMyAppointments,
  updateStatus,
  cancelAppointment,
  getAvailableSlots,
} = require('../controllers/appointmentController');
const { protect, doctorOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/slots', protect, getAvailableSlots);
router.post('/', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);
router.patch('/:id/status', protect, doctorOnly, updateStatus);
router.patch('/:id/cancel', protect, cancelAppointment);

module.exports = router;
