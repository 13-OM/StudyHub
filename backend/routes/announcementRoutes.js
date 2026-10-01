const express = require('express');
const router = express.Router();
const {
  updateAnnouncement,
  deleteAnnouncement,
  getMyAnnouncements,
} = require('../controllers/announcementController');
const { announcementRules, mongoIdParam } = require('../middleware/validators');
const { protect } = require('../middleware/authMiddleware');

// Announcements from all my groups (before /:id)
router.get('/my', protect, getMyAnnouncements);

router.put('/:id', protect, mongoIdParam('id'), announcementRules, updateAnnouncement);
router.delete('/:id', protect, mongoIdParam('id'), deleteAnnouncement);

module.exports = router;
