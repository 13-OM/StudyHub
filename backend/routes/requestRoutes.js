const express = require('express');
const router = express.Router();
const {
  approveRequest,
  rejectRequest,
  getMyRequests,
  getIncomingRequests,
} = require('../controllers/requestController');
const { mongoIdParam } = require('../middleware/validators');
const { protect } = require('../middleware/authMiddleware');

router.get('/my', protect, getMyRequests);
router.get('/incoming', protect, getIncomingRequests);
router.put('/:id/approve', protect, mongoIdParam('id'), approveRequest);
router.put('/:id/reject', protect, mongoIdParam('id'), rejectRequest);

module.exports = router;
