const router = require('express').Router();
const {
  getSlots, bookAppointment, getMyAppointments, updateStatus, cancelAppointment, markNoShow, getWaitingTime,
} = require('../controllers/appointmentController');
const { protect, doctorOnly, patientOnly } = require('../middleware/auth');

router.get('/slots', protect, getSlots);
router.get('/waiting-time', protect, getWaitingTime);
router.get('/my', protect, getMyAppointments);
router.post('/', protect, patientOnly, bookAppointment);
router.patch('/:id/status', protect, doctorOnly, updateStatus);
router.patch('/:id/cancel', protect, patientOnly, cancelAppointment);
router.patch('/:id/no-show', protect, doctorOnly, markNoShow);

module.exports = router;
