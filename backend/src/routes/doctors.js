const express = require('express');
const { getDoctors, toggleAvailability } = require('../controllers/doctorController');
const { protect, doctorOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getDoctors);
router.patch('/availability', protect, doctorOnly, toggleAvailability);

module.exports = router;
