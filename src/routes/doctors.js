const router = require('express').Router();
const { getDoctors, toggleAvailability, getDoctorStats } = require('../controllers/doctorController');
const { protect, doctorOnly } = require('../middleware/auth');

router.get('/', protect, getDoctors);
router.get('/stats', protect, doctorOnly, getDoctorStats);
router.patch('/availability', protect, doctorOnly, toggleAvailability);

module.exports = router;
