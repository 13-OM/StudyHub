const express = require('express');
const router = express.Router();
const {
  getGroups,
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  getMyGroups,
  getMembers,
  removeMember,
} = require('../controllers/groupController');
const {
  createJoinRequest,
  getGroupRequests,
} = require('../controllers/requestController');
const { getGroupSessions, createSession } = require('../controllers/sessionController');
const { getGroupResources, createResource } = require('../controllers/resourceController');
const {
  getGroupAnnouncements,
  createAnnouncement,
} = require('../controllers/announcementController');
const { getGroupAttendance } = require('../controllers/attendanceController');

const { groupRules, mongoIdParam } = require('../middleware/validators');
const {
  protect,
  requireGroupOwner,
  loadGroupMembership,
} = require('../middleware/authMiddleware');

// Browse + create
router
  .route('/')
  .get(protect, getGroups)
  .post(protect, groupRules, createGroup);

// Groups of the logged in user (must stay before /:id)
router.get('/my', protect, getMyGroups);

// Single group CRUD
router
  .route('/:id')
  .get(protect, mongoIdParam('id'), getGroupById)
  .put(protect, mongoIdParam('id'), requireGroupOwner, updateGroup)
  .delete(protect, mongoIdParam('id'), requireGroupOwner, deleteGroup);

// Members (owner only for removal)
router.get('/:id/members', protect, mongoIdParam('id'), getMembers);
router.delete('/:id/members/:userId', protect, mongoIdParam('id'), requireGroupOwner, removeMember);

// Join requests
router.post('/:id/join', protect, mongoIdParam('id'), createJoinRequest);
router.get('/:id/requests', protect, mongoIdParam('id'), requireGroupOwner, getGroupRequests);

// Sessions of a group (create = owner only)
router.get('/:id/sessions', protect, mongoIdParam('id'), loadGroupMembership, getGroupSessions);
router.post(
  '/:id/sessions',
  protect,
  mongoIdParam('id'),
  requireGroupOwner,
  require('../middleware/validators').sessionRules,
  createSession
);

// Resources of a group (any member can share)
router.get('/:id/resources', protect, mongoIdParam('id'), loadGroupMembership, getGroupResources);
router.post(
  '/:id/resources',
  protect,
  mongoIdParam('id'),
  loadGroupMembership,
  require('../middleware/validators').resourceRules,
  createResource
);

// Announcements (owner posts)
router.get('/:id/announcements', protect, mongoIdParam('id'), loadGroupMembership, getGroupAnnouncements);
router.post(
  '/:id/announcements',
  protect,
  mongoIdParam('id'),
  requireGroupOwner,
  require('../middleware/validators').announcementRules,
  createAnnouncement
);

// Attendance summary of a group
router.get('/:id/attendance', protect, mongoIdParam('id'), loadGroupMembership, getGroupAttendance);

module.exports = router;
