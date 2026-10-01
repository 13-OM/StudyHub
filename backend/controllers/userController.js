const User = require('../models/User');
const Group = require('../models/Group');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Resource = require('../models/Resource');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/users/profile
 * @desc    Get the logged in user's profile plus learning statistics
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Groups the user created or joined
  const [createdGroups, joinedGroups] = await Promise.all([
    Group.find({ createdBy: userId }).select('name subject members maxCapacity'),
    Group.find({ 'members.user': userId, createdBy: { $ne: userId } })
      .select('name subject members maxCapacity'),
  ]);

  const myGroupIds = [...createdGroups, ...joinedGroups].map((g) => g._id);

  // Sessions that were completed inside those groups
  const completedSessions = await Session.countDocuments({
    group: { $in: myGroupIds },
    status: 'Completed',
  });

  // Attendance of this user
  const attendanceRecords = await Attendance.find({ user: userId });
  const attended = attendanceRecords.filter((a) => a.status === 'Present').length;
  const attendanceRate = attendanceRecords.length
    ? Math.round((attended / attendanceRecords.length) * 100)
    : 0;

  const resourcesShared = await Resource.countDocuments({ _id: { $in: [] }, group: { $in: myGroupIds } });

  res.status(200).json({
    success: true,
    data: {
      user: req.user,
      stats: {
        groupsCreated: createdGroups.length,
        groupsJoined: joinedGroups.length,
        totalGroups: myGroupIds.length,
        sessionsCompleted: completedSessions,
        sessionsAttended: attended,
        sessionsMissed: attendanceRecords.length - attended,
        attendanceRate,
        resourcesShared,
      },
    },
  });
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update profile details (name, course, skill level, interests, bio, password)
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const { name, email, course, skillLevel, interests, bio, password } = req.body;

  // Email change -> make sure it is not already taken by someone else
  if (email && email.toLowerCase() !== user.email) {
    const emailTaken = await User.findOne({ email: email.toLowerCase() });
    if (emailTaken) throw new ApiError(400, 'That email is already registered');
    user.email = email.toLowerCase();
  }

  if (name) user.name = name;
  if (course) user.course = course;
  if (skillLevel) user.skillLevel = skillLevel;
  if (bio !== undefined) user.bio = bio;
  if (interests !== undefined) {
    user.interests = Array.isArray(interests)
      ? interests.map((i) => String(i).trim()).filter(Boolean)
      : String(interests).split(',').map((i) => i.trim()).filter(Boolean);
  }

  // Password is re-hashed by the pre-save hook only when it changes
  if (password) user.password = password;

  await user.save();

  const safeUser = await User.findById(user._id);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: safeUser },
  });
});

/**
 * @route   GET /api/users/:id
 * @desc    Public-ish view of another student (used in member lists)
 * @access  Private
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Student not found');
  res.status(200).json({ success: true, data: { user } });
});

module.exports = { getProfile, updateProfile, getUserById };
