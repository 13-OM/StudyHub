const express = require('express');
const router = express.Router();
const { getMyAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

// My personal attendance history
router.get('/my', protect, getMyAttendance);

module.exports = router;
