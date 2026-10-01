const Session = require('../models/Session');
const Group = require('../models/Group');
const Attendance = require('../models/Attendance');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/** Returns the ids of every group the user belongs to (as owner or member). */
const getMyGroupIds = async (userId) => {
  const groups = await Group.find({
    $or: [{ createdBy: userId }, { 'members.user': userId }],
  }).select('_id');
  return groups.map((g) => g._id);
};

/** Normalise agenda / topics which may arrive as array or newline separated text. */
const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split('\n')
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, '').trim())
    .filter(Boolean);
};

/**
 * @route   GET /api/groups/:id/sessions
 * @desc    All sessions of a group (newest date first) with attendance summary
 * @access  Private (member)
 */
const getGroupSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ group: req.params.id })
    .sort({ date: -1, startTime: -1 })
    .lean();

  // count of present records per session (for "5/6 attended")
  const attendanceCounts = await Attendance.aggregate([
    { $match: { group: new (require('mongoose').Types.ObjectId)(req.params.id), status: 'Present' } },
    { $group: { _id: '$session', present: { $sum: 1 } } },
  ]);
  const countMap = attendanceCounts.reduce((acc, c) => {
    acc[c._id.toString()] = c.present;
    return acc;
  }, {});

  const data = sessions.map((s) => ({
    ...s,
    presentCount: countMap[s._id.toString()] || 0,
  }));

  const now = new Date();
  res.status(200).json({
    success: true,
    count: data.length,
    data: {
      sessions: data,
      stats: {
        total: data.length,
        upcoming: data.filter((s) => s.status === 'Upcoming' && new Date(s.date) >= now).length,
        completed: data.filter((s) => s.status === 'Completed').length,
        cancelled: data.filter((s) => s.status === 'Cancelled').length,
      },
    },
  });
});

/**
 * @route   POST /api/groups/:id/sessions
 * @desc    Schedule a new study session (owner only)
 * @access  Private (Owner)
 */
const createSession = asyncHandler(async (req, res) => {
  const { title, learningObjective, agenda, topics, expectedOutcome, date, startTime, duration,
    meetingLink, notes } = req.body;

  const sessionDate = new Date(date);
  if (Number.isNaN(sessionDate.getTime())) throw new ApiError(400, 'Invalid session date');

  const session = await Session.create({
    group: req.group._id,
    title,
    learningObjective: learningObjective || '',
    agenda: toArray(agenda),
    topics: toArray(topics),
    expectedOutcome: expectedOutcome || '',
    date: sessionDate,
    startTime,
    duration,
    meetingLink: meetingLink || '',
    notes: notes || '',
    status: 'Upcoming',
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Study session scheduled successfully.',
    data: { session },
  });
});

/**
 * @route   GET /api/sessions/:id
 * @desc    Single session with its group info and attendance records
 * @access  Private (member)
 */
const getSessionById = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id).populate('group', 'name subject topic createdBy members');
  if (!session) throw new ApiError(404, 'Session not found');

  const isMember = session.group.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (!isMember) throw new ApiError(403, 'Access denied: you are not a member of this group');

  const attendance = await Attendance.find({ session: session._id })
    .populate('user', 'name course skillLevel avatarColor');

  res.status(200).json({ success: true, data: { session, attendance } });
});

/**
 * @route   PUT /api/sessions/:id
 * @desc    Edit a session or change its status (owner only)
 * @access  Private (Owner)
 */
const updateSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Session not found');

  const group = await Group.findById(session.group);
  if (!group) throw new ApiError(404, 'Study group not found');
  if (group.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied: only the group owner can edit sessions');
  }

  const {
    title, learningObjective, agenda, topics, expectedOutcome,
    date, startTime, duration, meetingLink, notes, status,
  } = req.body;

  if (title) session.title = title;
  if (learningObjective !== undefined) session.learningObjective = learningObjective;
  if (agenda !== undefined) session.agenda = toArray(agenda);
  if (topics !== undefined) session.topics = toArray(topics);
  if (expectedOutcome !== undefined) session.expectedOutcome = expectedOutcome;
  if (date) session.date = new Date(date);
  if (startTime) session.startTime = startTime;
  if (duration) session.duration = duration;
  if (meetingLink !== undefined) session.meetingLink = meetingLink;
  if (notes !== undefined) session.notes = notes;
  if (status) session.status = status;

  await session.save();

  res.status(200).json({ success: true, message: 'Session updated successfully', data: { session } });
});

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Delete a session and its attendance (owner only)
 * @access  Private (Owner)
 */
const deleteSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Session not found');

  const group = await Group.findById(session.group);
  if (!group) throw new ApiError(404, 'Study group not found');
  if (group.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied: only the group owner can delete sessions');
  }

  await Attendance.deleteMany({ session: session._id });
  await session.deleteOne();

  res.status(200).json({ success: true, message: 'Session deleted successfully' });
});

/**
 * @route   GET /api/sessions/my
 * @desc    Sessions across all groups the user belongs to
 * @access  Private
 */
const getMySessions = asyncHandler(async (req, res) => {
  const groupIds = await getMyGroupIds(req.user._id);

  const sessions = await Session.find({ group: { $in: groupIds } })
    .populate('group', 'name subject topic course')
    .sort({ date: -1, startTime: -1 })
    .lean();

  const now = new Date();
  const upcoming = sessions
    .filter((s) => s.status === 'Upcoming' || s.status === 'In Progress')
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const completed = sessions.filter((s) => s.status === 'Completed');
  const cancelled = sessions.filter((s) => s.status === 'Cancelled');

  res.status(200).json({
    success: true,
    data: { sessions, upcoming, completed, cancelled, today: now },
  });
});

module.exports = {
  getGroupSessions,
  createSession,
  getSessionById,
  updateSession,
  deleteSession,
  getMySessions,
  getMyGroupIds,
};
