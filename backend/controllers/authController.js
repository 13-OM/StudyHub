const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** Colours used to generate a friendly avatar for every new user. */
const AVATAR_COLORS = [
  '#4f46e5', '#7c3aed', '#0ea5e9', '#059669',
  '#d97706', '#db2777', '#0891b2', '#dc2626',
];

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student account
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, course, skillLevel, interests, bio } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, 'An account with this email already exists. Please login instead.');
  }

  // interests can arrive as an array or as a comma separated string
  let interestList = [];
  if (Array.isArray(interests)) {
    interestList = interests.map((i) => String(i).trim()).filter(Boolean);
  } else if (typeof interests === 'string' && interests.trim()) {
    interestList = interests.split(',').map((i) => i.trim()).filter(Boolean);
  }

  const user = await User.create({
    name,
    email,
    password, // hashed automatically by the pre-save hook in the model
    course,
    skillLevel: skillLevel || 'Beginner',
    interests: interestList,
    bio: bio || '',
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Welcome to StudyHub!',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        skillLevel: user.skillLevel,
        interests: user.interests,
        avatarColor: user.avatarColor,
      },
      token: generateToken(user._id),
    },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login with email + password and receive a JWT
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // password has select:false in the model, so ask for it explicitly
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    // Same message for both cases -> does not reveal which emails exist
    throw new ApiError(401, 'Invalid email or password.');
  }

  res.status(200).json({
    success: true,
    message: `Welcome back, ${user.name.split(' ')[0]}!`,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        course: user.course,
        skillLevel: user.skillLevel,
        interests: user.interests,
        bio: user.bio,
        avatarColor: user.avatarColor,
      },
      token: generateToken(user._id),
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Return the currently logged in user (used to restore session)
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Stateless JWT logout - the client simply deletes the token.
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = { register, login, getMe, logout };
