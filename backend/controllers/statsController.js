const Group = require('../models/Group');
const Session = require('../models/Session');
const JoinRequest = require('../models/JoinRequest');
const Resource = require('../models/Resource');
const Announcement = require('../models/Announcement');
const Attendance = require('../models/Attendance');
const asyncHandler = require('../utils/asyncHandler');
const { formatGroup } = require('../services/groupService');
const { getMyGroupIds } = require('./sessionController');

/**
 * @route   GET /api/stats/dashboard
 * @desc    Everything the dashboard needs in a single request:
 *          stat cards, upcoming sessions, recent activity, recommendations.
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const groupIds = await getMyGroupIds(userId);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalGroups,
    createdGroups,
    myGroups,
    upcomingSessionsCount,
    completedSessionsCount,
    resourcesCount,
    announcementsCount,
    pendingRequests,
    myAttendance,
  ] = await Promise.all([
    Group.countDocuments({ status: 'Active' }),
    Group.countDocuments({ createdBy: userId }),
    Group.countDocuments({ $or: [{ createdBy: userId }, { 'members.user': userId }] }),
    Session.countDocuments({
      group: { $in: groupIds },
      status: { $in: ['Upcoming', 'In Progress'] },
      date: { $gte: startOfToday },
    }),
    Session.countDocuments({ group: { $in: groupIds }, status: 'Completed' }),
    Resource.countDocuments({ group: { $in: groupIds } }),
    Announcement.countDocuments({ group: { $in: groupIds } }),
    JoinRequest.countDocuments({
      group: { $in: groupIds },
      status: 'Pending',
    }),
    Attendance.find({ user: userId }).select('status'),
  ]);

  // How many of my groups were created this month (for the "+2 this month" hint)
  const groupsThisMonth = await Group.countDocuments({
    createdAt: { $gte: startOfMonth },
    $or: [{ createdBy: userId }, { 'members.user': userId }],
  });

  const attended = myAttendance.filter((a) => a.status === 'Present').length;
  const attendanceRate = myAttendance.length
    ? Math.round((attended / myAttendance.length) * 100)
    : 0;

  // ---- Upcoming sessions of my groups (next 5) ----
  const upcomingSessions = await Session.find({
    group: { $in: groupIds },
    status: { $in: ['Upcoming', 'In Progress'] },
    date: { $gte: startOfToday },
  })
    .populate('group', 'name subject topic')
    .sort({ date: 1, startTime: 1 })
    .limit(5)
    .lean();

  // ---- Recommended groups: active, have free seats, not mine yet ----
  const myGroupObjects = await Group.find({ _id: { $in: groupIds } }).select('_id');
  const myIds = myGroupObjects.map((g) => g._id.toString());

  const candidates = await Group.find({
    status: 'Active',
    createdBy: { $nin: [userId] },
    'members.user': { $nin: [userId] },
    $expr: { $lt: [{ $size: '$members' }, '$maxCapacity'] },
  })
    .populate([
      { path: 'createdBy', select: 'name course avatarColor' },
      { path: 'members.user', select: 'name course skillLevel avatarColor' },
    ])
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const recommended = candidates.map((g) => formatGroup(g, userId, {}));

  // ---- Recent activity feed ----
  const recentSessions = await Session.find({ group: { $in: groupIds } })
    .populate('group', 'name')
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const recentRequests = await JoinRequest.find({ group: { $in: groupIds } })
    .populate('user', 'name')
    .populate('group', 'name')
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const recentResources = await Resource.find({ group: { $in: groupIds } })
    .populate('addedBy', 'name')
    .populate('group', 'name')
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const recentAnnouncements = await Announcement.find({ group: { $in: groupIds } })
    .populate('postedBy', 'name')
    .populate('group', 'name')
    .sort({ createdAt: -1 })
    .limit(4)
    .lean();

  const activity = [
    ...recentSessions.map((s) => ({
      type: 'session',
      title: `Session "${s.title}" ${s.status.toLowerCase()}`,
      subtitle: s.group?.name || 'Group',
      date: s.createdAt,
    })),
    ...recentRequests.map((r) => ({
      type: 'request',
      title: `${r.user?.name || 'A student'} requested to join`,
      subtitle: `${r.group?.name || 'Group'} • ${r.status}`,
      date: r.createdAt,
    })),
    ...recentResources.map((r) => ({
      type: 'resource',
      title: `Resource "${r.title}" shared`,
      subtitle: `${r.group?.name || 'Group'} • by ${r.addedBy?.name || 'member'}`,
      date: r.createdAt,
    })),
    ...recentAnnouncements.map((a) => ({
      type: 'announcement',
      title: `Announcement: ${a.title}`,
      subtitle: a.group?.name || 'Group',
      date: a.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalGroups,
        myGroups,
        groupsCreated: createdGroups,
        groupsJoined: myGroups - createdGroups,
        groupsThisMonth,
        upcomingSessions: upcomingSessionsCount,
        completedSessions: completedSessionsCount,
        attendanceRate,
        sessionsAttended: attended,
        pendingRequests,
        resourcesShared: resourcesCount,
        announcements: announcementsCount,
      },
      upcomingSessions,
      recommendedGroups: recommended,
      recentActivity: activity,
    },
  });
});

/**
 * @route   GET /api/stats/history
 * @desc    Completed / cancelled session history with attendance numbers.
 *          Supports ?from, ?to, ?groupId, ?subject filters.
 * @access  Private
 */
const getSessionHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const groupIds = await getMyGroupIds(userId);

  const sessionFilter = { group: { $in: groupIds }, status: { $in: ['Completed', 'Cancelled'] } };

  if (req.query.groupId) sessionFilter.group = req.query.groupId;
  if (req.query.from || req.query.to) {
    sessionFilter.date = {};
    if (req.query.from) sessionFilter.date.$gte = new Date(req.query.from);
    if (req.query.to) sessionFilter.date.$lte = new Date(`${req.query.to}T23:59:59.999Z`);
  }

  let sessions = await Session.find(sessionFilter)
    .populate('group', 'name subject topic course members')
    .sort({ date: -1 })
    .lean();

  // Filter by subject (needs the populated group)
  if (req.query.subject) {
    const subject = String(req.query.subject).toLowerCase();
    sessions = sessions.filter((s) => s.group?.subject?.toLowerCase() === subject);
  }

  const sessionIds = sessions.map((s) => s._id);
  const presentCounts = await Attendance.aggregate([
    { $match: { session: { $in: sessionIds }, status: 'Present' } },
    { $group: { _id: '$session', present: { $sum: 1 } } },
  ]);
  const countMap = presentCounts.reduce((acc, c) => {
    acc[c._id.toString()] = c.present;
    return acc;
  }, {});

  const myRecords = await Attendance.find({ user: userId, session: { $in: sessionIds } });
  const myStatusMap = myRecords.reduce((acc, r) => {
    acc[r.session.toString()] = r.status;
    return acc;
  }, {});

  const history = sessions.map((s) => ({
    _id: s._id,
    title: s.title,
    date: s.date,
    startTime: s.startTime,
    duration: s.duration,
    status: s.status,
    agenda: s.agenda,
    topics: s.topics,
    learningObjective: s.learningObjective,
    expectedOutcome: s.expectedOutcome,
    group: s.group ? { _id: s.group._id, name: s.group.name, subject: s.group.subject, topic: s.group.topic } : null,
    presentCount: countMap[s._id.toString()] || 0,
    totalMembers: s.group?.members?.length || 0,
    myStatus: myStatusMap[s._id.toString()] || null,
  }));

  // Subject list for the dropdown
  const myGroups = await Group.find({ _id: { $in: groupIds } }).select('name subject');
  const subjects = [...new Set(myGroups.map((g) => g.subject))].sort();

  res.status(200).json({
    success: true,
    count: history.length,
    data: { history, groups: myGroups, subjects },
  });
});

module.exports = { getDashboardStats, getSessionHistory };
