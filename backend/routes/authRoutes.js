const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { registerRules, loginRules } = require('../middleware/validators');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
