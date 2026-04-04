const router = require('express').Router();
const {
  getDoctors, toggleAvailability, setOffDays, setConsultationType, getDoctorStats, getAllDoctorRankings,
} = require('../controllers/doctorController');
const { protect, doctorOnly } = require('../middleware/auth');

router.get('/', protect, getDoctors);
router.get('/stats', protect, doctorOnly, getDoctorStats);
router.get('/rankings', protect, getAllDoctorRankings);
router.patch('/availability', protect, doctorOnly, toggleAvailability);
router.patch('/off-days', protect, doctorOnly, setOffDays);
router.patch('/consultation-type', protect, doctorOnly, setConsultationType);

module.exports = router;
