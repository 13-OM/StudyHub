const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const Group = require('../models/Group');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getMyGroupIds } = require('./sessionController');

/**
 * @route   POST /api/sessions/:id/attendance
 * @desc    Save (or update) attendance for a session. Owner only.
 *          Body: { records: [{ user: id, status: 'Present'|'Absent' }] }
 * @access  Private (Owner)
 */
const markAttendance = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Session not found');

  const group = await Group.findById(session.group);
  if (!group) throw new ApiError(404, 'Study group not found');

  if (group.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied: only the group owner can mark attendance');
  }

  const { records } = req.body;
  const memberIds = group.members.map((m) => m.user.toString());

  // Validate that every record belongs to a real member of this group
  const invalid = records.find((r) => !memberIds.includes(r.user));
  if (invalid) {
    throw new ApiError(400, 'Attendance contains a student who is not a member of this group');
  }

  // Upsert each record (no duplicates thanks to the unique index)
  const saved = await Promise.all(
    records.map((record) =>
      Attendance.findOneAndUpdate(
        { session: session._id, user: record.user },
        {
          session: session._id,
          group: group._id,
          user: record.user,
          status: record.status,
          markedBy: req.user._id,
        },
        { upsert: true, setDefaultsOnInsert: true, returnDocument: 'after' }
      )
    )
  );

  session.attendanceMarked = true;
  await session.save();

  res.status(200).json({
    success: true,
    message: 'Attendance saved successfully',
    data: { attendance: saved },
  });
});

/**
 * @route   GET /api/sessions/:id/attendance
 * @desc    Attendance of one session
 * @access  Private (member)
 */
const getSessionAttendance = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Session not found');

  const group = await Group.findById(session.group).populate('members.user', 'name course skillLevel avatarColor');

  const isMember = group.members.some(
    (m) => m.user._id.toString() === req.user._id.toString()
  );
  if (!isMember) throw new ApiError(403, 'Access denied: you are not a member of this group');

  const records = await Attendance.find({ session: session._id }).populate(
    'user',
    'name course skillLevel avatarColor'
  );

  const recordMap = {};
  records.forEach((r) => {
    recordMap[r.user._id.toString()] = r.status;
  });

  // Return one row per member so the marking table is always complete
  const rows = group.members.map((m) => ({
    user: m.user,
    role: m.role,
    status: recordMap[m.user._id.toString()] || null,
  }));

  const present = rows.filter((r) => r.status === 'Present').length;
  const marked = rows.filter((r) => r.status).length;

  res.status(200).json({
    success: true,
    data: {
      session,
      rows,
      summary: {
        totalMembers: rows.length,
        present,
        absent: marked - present,
        unmarked: rows.length - marked,
        percentage: rows.length ? Math.round((present / rows.length) * 100) : 0,
      },
    },
  });
});

/**
 * @route   GET /api/groups/:id/attendance
 * @desc    Attendance summary of every member in one group
 * @access  Private (member)
 */
const getGroupAttendance = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id).populate(
    'members.user',
    'name course skillLevel avatarColor'
  );
  if (!group) throw new ApiError(404, 'Study group not found');

  const isMember = group.members.some(
    (m) => m.user._id.toString() === req.user._id.toString()
  );
  if (!isMember) throw new ApiError(403, 'Access denied: you are not a member of this group');

  const completedSessionsCount = await Session.countDocuments({
    group: group._id,
    status: { $in: ['Completed', 'In Progress'] },
  });

  const summary = await Attendance.aggregate([
    { $match: { group: group._id } },
    { $group: { _id: '$user', present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } }, total: { $sum: 1 } } },
  ]);

  const summaryMap = summary.reduce((acc, s) => {
    acc[s._id.toString()] = s;
    return acc;
  }, {});

  const members = group.members.map((m) => {
    const stat = summaryMap[m.user._id.toString()] || { present: 0, total: 0 };
    return {
      user: m.user,
      role: m.role,
      sessionsAttended: stat.present,
      sessionsMissed: stat.total - stat.present,
      attendanceRate: stat.total ? Math.round((stat.present / stat.total) * 100) : 0,
    };
  });

  const totalMarked = summary.reduce((sum, s) => sum + s.total, 0);
  const totalPresent = summary.reduce((sum, s) => sum + s.present, 0);

  res.status(200).json({
    success: true,
    data: {
      members,
      overall: {
        completedSessions: completedSessionsCount,
        markedRecords: totalMarked,
        presentRecords: totalPresent,
        attendanceRate: totalMarked ? Math.round((totalPresent / totalMarked) * 100) : 0,
      },
    },
  });
});

/**
 * @route   GET /api/attendance/my
 * @desc    Personal attendance history across all my groups + session history
 * @access  Private
 */
const getMyAttendance = asyncHandler(async (req, res) => {
  const groupIds = await getMyGroupIds(req.user._id);

  const records = await Attendance.find({ user: req.user._id })
    .populate({ path: 'session', select: 'title date duration agenda topics status group' })
    .populate({ path: 'group', select: 'name subject topic' })
    .sort({ createdAt: -1 });

  const validRecords = records.filter((r) => r.session);
  const present = validRecords.filter((r) => r.status === 'Present').length;
  const absent = validRecords.length - present;

  // Completed sessions of my groups = the history page data
  const history = await Session.find({
    group: { $in: groupIds },
    status: { $in: ['Completed', 'Cancelled'] },
  })
    .populate('group', 'name subject topic')
    .sort({ date: -1 })
    .lean();

  const sessionIds = history.map((s) => s._id);
  const counts = await Attendance.aggregate([
    { $match: { session: { $in: sessionIds }, status: 'Present' } },
    { $group: { _id: '$session', present: { $sum: 1 } } },
  ]);
  const countMap = counts.reduce((acc, c) => {
    acc[c._id.toString()] = c.present;
    return acc;
  }, {});

  // how many members each of those groups has (for "5/6 attended")
  const groupSizes = await Group.find({ _id: { $in: groupIds } }).select('members');
  const sizeMap = groupSizes.reduce((acc, g) => {
    acc[g._id.toString()] = g.members.length;
    return acc;
  }, {});

  const historyData = history.map((s) => ({
    ...s,
    presentCount: countMap[s._id.toString()] || 0,
    totalMembers: sizeMap[s.group?._id?.toString()] || 0,
    myStatus:
      validRecords.find((r) => r.session && r.session._id.toString() === s._id.toString())
        ?.status || null,
  }));

  res.status(200).json({
    success: true,
    data: {
      records: validRecords,
      history: historyData,
      summary: {
        sessionsAttended: present,
        sessionsMissed: absent,
        totalMarked: validRecords.length,
        attendanceRate: validRecords.length ? Math.round((present / validRecords.length) * 100) : 0,
      },
    },
  });
});

module.exports = {
  markAttendance,
  getSessionAttendance,
  getGroupAttendance,
  getMyAttendance,
};
