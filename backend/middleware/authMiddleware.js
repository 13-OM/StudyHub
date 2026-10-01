const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Group = require('../models/Group');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * protect - authentication middleware.
 * Reads the JWT from the "Authorization" header, verifies it and
 * attaches the matching user document to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized, please login first');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, 'Session expired or token is invalid, please login again');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, 'This user account no longer exists');
  }

  req.user = user;
  next();
});

/**
 * requireGroupOwner - authorization middleware.
 * Loads the group from :id (or :groupId) and allows only the creator
 * to continue. Also stores the group on req.group so controllers reuse it.
 */
const requireGroupOwner = asyncHandler(async (req, res, next) => {
  const groupId = req.params.id || req.params.groupId;
  const group = await Group.findById(groupId);

  if (!group) throw new ApiError(404, 'Study group not found');

  if (group.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied: only the group owner can perform this action');
  }

  req.group = group;
  next();
});

/**
 * loadGroupMembership - loads the group and checks that the logged in user
 * is either the owner or a member. Members can only READ, so controllers
 * that use this middleware never modify data.
 */
const loadGroupMembership = asyncHandler(async (req, res, next) => {
  const groupId = req.params.id || req.params.groupId;
  const group = await Group.findById(groupId);

  if (!group) throw new ApiError(404, 'Study group not found');

  const isOwner = group.createdBy.toString() === req.user._id.toString();
  const isMember = group.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );

  if (!isOwner && !isMember) {
    throw new ApiError(403, 'Access denied: you are not a member of this group');
  }

  req.group = group;
  req.isOwner = isOwner;
  next();
});

module.exports = { protect, requireGroupOwner, loadGroupMembership };
