const Group = require('../models/Group');
const JoinRequest = require('../models/JoinRequest');
const Session = require('../models/Session');
const Resource = require('../models/Resource');
const Announcement = require('../models/Announcement');
const Attendance = require('../models/Attendance');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const {
  buildGroupFilter,
  buildSort,
  formatGroup,
} = require('../services/groupService');

const USER_FIELDS = 'name email course skillLevel avatarColor';
const GROUP_POPULATE = [
  { path: 'createdBy', select: USER_FIELDS },
  { path: 'members.user', select: USER_FIELDS },
];

/**
 * @route   GET /api/groups
 * @desc    Browse / search / filter / sort study groups
 * @access  Private
 * @query   q, course, subject, topic, skillLevel, day, time, available, sort, page, limit
 */
const getGroups = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

  const filter = buildGroupFilter(req.query, req.user._id);

  // groups the user is already part of should not be hidden, but we need
  // join-request status to decide the button label
  const total = await Group.countDocuments(filter);

  let groups = await Group.find(filter)
    .populate(GROUP_POPULATE)
    .sort(buildSort(req.query.sort))
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  // Map of groupId -> request status for the logged in user
  const groupIds = groups.map((g) => g._id);
  const myRequests = await JoinRequest.find({
    user: req.user._id,
    group: { $in: groupIds },
  }).lean();

  const requestStatusMap = myRequests.reduce((acc, r) => {
    acc[r.group.toString()] = r.status;
    return acc;
  }, {});

  const formatted = groups.map((g) => formatGroup(g, req.user._id, requestStatusMap));

  // Sorting by computed fields (memberCount / seatsLeft) is easier in memory
  if (req.query.sort === 'members') formatted.sort((a, b) => b.memberCount - a.memberCount);
  if (req.query.sort === 'seats') formatted.sort((a, b) => b.seatsLeft - a.seatsLeft);

  res.status(200).json({
    success: true,
    count: formatted.length,
    total, // total matching the filter (for "12 study groups found")
    page,
    pages: Math.ceil(total / limit) || 1,
    data: { groups: formatted },
  });
});

/**
 * @route   POST /api/groups
 * @desc    Create a study group. The creator automatically becomes the Owner member.
 * @access  Private
 */
const createGroup = asyncHandler(async (req, res) => {
  const { name, subject, topic, course, skillLevel, maxCapacity, schedule, description } = req.body;

  const group = await Group.create({
    name,
    subject,
    topic,
    course,
    skillLevel,
    maxCapacity,
    schedule,
    description,
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: 'Owner', joinedAt: new Date() }],
  });

  const populated = await Group.findById(group._id).populate(GROUP_POPULATE).lean();

  res.status(201).json({
    success: true,
    message: 'Study group created successfully.',
    data: { group: formatGroup(populated, req.user._id, {}) },
  });
});

/**
 * @route   GET /api/groups/:id
 * @desc    Full details of one group (with viewer permissions)
 * @access  Private
 */
const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate(GROUP_POPULATE).lean();
  if (!group) throw new ApiError(404, 'Study group not found');

  const myRequest = await JoinRequest.findOne({
    group: group._id,
    user: req.user._id,
  }).lean();

  const requestStatusMap = myRequest ? { [group._id.toString()]: myRequest.status } : {};

  res.status(200).json({
    success: true,
    data: { group: formatGroup(group, req.user._id, requestStatusMap) },
  });
});

/**
 * @route   PUT /api/groups/:id
 * @desc    Update group details (owner only). Capacity cannot go below current members.
 * @access  Private (Owner)
 */
const updateGroup = asyncHandler(async (req, res) => {
  const group = req.group; // loaded by requireGroupOwner middleware

  const { name, subject, topic, course, skillLevel, maxCapacity, schedule, description, status } =
    req.body;

  if (maxCapacity !== undefined && Number(maxCapacity) < group.members.length) {
    throw new ApiError(
      400,
      `Capacity cannot be lower than the current member count (${group.members.length})`
    );
  }

  if (name) group.name = name;
  if (subject) group.subject = subject;
  if (topic) group.topic = topic;
  if (course) group.course = course;
  if (skillLevel) group.skillLevel = skillLevel;
  if (maxCapacity !== undefined) group.maxCapacity = maxCapacity;
  if (schedule) group.schedule = { ...group.schedule.toObject?.() ?? group.schedule, ...schedule };
  if (description) group.description = description;
  if (status) group.status = status;

  await group.save();

  const populated = await Group.findById(group._id).populate(GROUP_POPULATE).lean();
  res.status(200).json({
    success: true,
    message: 'Group updated successfully',
    data: { group: formatGroup(populated, req.user._id, {}) },
  });
});

/**
 * @route   DELETE /api/groups/:id
 * @desc    Delete a group and everything that belongs to it (owner only)
 * @access  Private (Owner)
 */
const deleteGroup = asyncHandler(async (req, res) => {
  const groupId = req.group._id;

  await Promise.all([
    Session.deleteMany({ group: groupId }),
    Resource.deleteMany({ group: groupId }),
    Announcement.deleteMany({ group: groupId }),
    Attendance.deleteMany({ group: groupId }),
    JoinRequest.deleteMany({ group: groupId }),
    Group.findByIdAndDelete(groupId),
  ]);

  res.status(200).json({ success: true, message: 'Study group deleted successfully' });
});

/**
 * @route   GET /api/groups/my
 * @desc    Groups created by me, groups I joined, plus pending requests I sent
 * @access  Private
 */
const getMyGroups = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const created = await Group.find({ createdBy: userId })
    .populate(GROUP_POPULATE)
    .sort({ createdAt: -1 })
    .lean();

  const joined = await Group.find({
    createdBy: { $ne: userId },
    'members.user': userId,
  })
    .populate(GROUP_POPULATE)
    .sort({ createdAt: -1 })
    .lean();

  // Next upcoming session for each group (shown on the cards)
  const allIds = [...created, ...joined].map((g) => g._id);
  const nextSessions = await Session.find({
    group: { $in: allIds },
    status: { $in: ['Upcoming', 'In Progress'] },
    date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
  })
    .sort({ date: 1, startTime: 1 })
    .lean();

  const nextSessionMap = {};
  nextSessions.forEach((s) => {
    const key = s.group.toString();
    if (!nextSessionMap[key]) nextSessionMap[key] = s;
  });

  const attach = (g) => ({
    ...formatGroup(g, userId, {}),
    nextSession: nextSessionMap[g._id.toString()] || null,
  });

  const myPendingRequests = await JoinRequest.find({ user: userId, status: 'Pending' })
    .populate({ path: 'group', select: 'name subject topic course skillLevel maxCapacity members' })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: {
      created: created.map(attach),
      joined: joined.map(attach),
      pendingRequests: myPendingRequests,
    },
  });
});

/**
 * @route   GET /api/groups/:id/members
 * @desc    Member list of a group
 * @access  Private (member of the group)
 */
const getMembers = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate('members.user', USER_FIELDS);

  if (!group) throw new ApiError(404, 'Study group not found');

  const isMember = group.members.some(
    (m) => m.user && m.user._id.toString() === req.user._id.toString()
  );

  if (!isMember) {
    throw new ApiError(403, 'Access denied: you are not a member of this group');
  }

  const members = group.members.map((m) => ({
    user: m.user,
    role: m.role,
    joinedAt: m.joinedAt,
  }));

  res.status(200).json({ success: true, count: members.length, data: { members } });
});

/**
 * @route   DELETE /api/groups/:id/members/:userId
 * @desc    Remove a member from the group (owner only, cannot remove self)
 * @access  Private (Owner)
 */
const removeMember = asyncHandler(async (req, res) => {
  const group = req.group;
  const { userId } = req.params;

  if (userId === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot remove yourself from the group');
  }

  const memberIndex = group.members.findIndex(
    (m) => m.user.toString() === userId
  );

  if (memberIndex === -1) throw new ApiError(404, 'This student is not a member of the group');

  if (group.members[memberIndex].role === 'Owner') {
    throw new ApiError(400, 'The owner cannot be removed from the group');
  }

  group.members.splice(memberIndex, 1);
  await group.save();

  res.status(200).json({ success: true, message: 'Member removed from the group' });
});

module.exports = {
  getGroups,
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  getMyGroups,
  getMembers,
  removeMember,
};
