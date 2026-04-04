const router = require('express').Router();
const {
  getDoctors, toggleAvailability, setOffDays, setConsultationType, getDoctorStats,
} = require('../controllers/doctorController');
const { protect, doctorOnly } = require('../middleware/auth');

router.get('/', protect, getDoctors);
router.get('/stats', protect, doctorOnly, getDoctorStats);
router.patch('/availability', protect, doctorOnly, toggleAvailability);
router.patch('/off-days', protect, doctorOnly, setOffDays);
router.patch('/consultation-type', protect, doctorOnly, setConsultationType);

module.exports = router;
