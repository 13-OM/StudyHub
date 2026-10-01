const express = require('express');
const router = express.Router();
const { getDashboardStats, getSessionHistory } = require('../controllers/statsController');
const { getSubjects, getPublicStats } = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, getDashboardStats);
router.get('/history', protect, getSessionHistory);
router.get('/subjects', getSubjects);
router.get('/public', getPublicStats);

module.exports = router;
