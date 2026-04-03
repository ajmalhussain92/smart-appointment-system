const router = require('express').Router();
const { getDoctors, toggleAvailability } = require('../controllers/doctorController');
const { protect, doctorOnly } = require('../middleware/auth');

router.get('/', protect, getDoctors);
router.patch('/availability', protect, doctorOnly, toggleAvailability);

module.exports = router;
