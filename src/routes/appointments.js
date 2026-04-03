const router = require('express').Router();
const {
  getSlots, bookAppointment, getMyAppointments, updateStatus, cancelAppointment,
} = require('../controllers/appointmentController');
const { protect, doctorOnly, patientOnly } = require('../middleware/auth');

router.get('/slots', protect, getSlots);
router.get('/my', protect, getMyAppointments);
router.post('/', protect, patientOnly, bookAppointment);
router.patch('/:id/status', protect, doctorOnly, updateStatus);
router.patch('/:id/cancel', protect, patientOnly, cancelAppointment);

module.exports = router;
