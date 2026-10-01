const express = require('express');
const router = express.Router();
const {
  updateResource,
  deleteResource,
  getMyResources,
} = require('../controllers/resourceController');
const { resourceRules, mongoIdParam } = require('../middleware/validators');
const { protect } = require('../middleware/authMiddleware');

// Resources across all my groups (before /:id)
router.get('/my', protect, getMyResources);

router.put('/:id', protect, mongoIdParam('id'), resourceRules, updateResource);
router.delete('/:id', protect, mongoIdParam('id'), deleteResource);

module.exports = router;
