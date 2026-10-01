const express = require('express');
const router = express.Router();
const {
  getSessionById,
  updateSession,
  deleteSession,
  getMySessions,
} = require('../controllers/sessionController');
const { markAttendance, getSessionAttendance } = require('../controllers/attendanceController');
const { sessionRules, sessionUpdateRules, attendanceRules, mongoIdParam } = require('../middleware/validators');
const { protect } = require('../middleware/authMiddleware');

// Sessions of all my groups (before /:id)
router.get('/my', protect, getMySessions);

router
  .route('/:id')
  .get(protect, mongoIdParam('id'), getSessionById)
  .put(protect, mongoIdParam('id'), sessionUpdateRules, updateSession)
  .delete(protect, mongoIdParam('id'), deleteSession);

// Attendance of one session
router.get('/:id/attendance', protect, mongoIdParam('id'), getSessionAttendance);
router.post('/:id/attendance', protect, mongoIdParam('id'), attendanceRules, markAttendance);

module.exports = router;
