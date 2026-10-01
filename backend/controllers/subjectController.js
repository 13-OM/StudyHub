const Subject = require('../models/Subject');
const Group = require('../models/Group');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/subjects
 * @desc    Subject catalogue with topics + popular subjects for the landing page
 * @access  Public
 */
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find().sort({ name: 1 });

  // How many active groups exist for each subject / course (used by filters)
  const bySubject = await Group.aggregate([
    { $match: { status: 'Active' } },
    { $group: { _id: '$subject', count: { $sum: 1 } } },
  ]);
  const byCourse = await Group.aggregate([
    { $match: { status: 'Active' } },
    { $group: { _id: '$course', count: { $sum: 1 } } },
  ]);

  const subjectCounts = bySubject.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});

  res.status(200).json({
    success: true,
    data: {
      subjects: subjects.map((s) => ({
        ...s.toObject(),
        groupCount: subjectCounts[s.name] || 0,
      })),
      courses: byCourse.map((c) => ({ name: c._id, count: c.count })).sort((a, b) => a.name.localeCompare(b.name)),
      subjectsInUse: bySubject.map((s) => ({ name: s._id, count: s.count })).sort((a, b) => b.count - a.count),
    },
  });
});

/**
 * @route   GET /api/subjects/popular
 * @desc    Aggregated public statistics for the landing page
 * @access  Public
 */
const getPublicStats = asyncHandler(async (req, res) => {
  const [students, groups, sessions, resources] = await Promise.all([
    require('../models/User').countDocuments(),
    Group.countDocuments({ status: 'Active' }),
    require('../models/Session').countDocuments(),
    require('../models/Resource').countDocuments(),
  ]);

  const popular = await Group.aggregate([
    { $match: { status: 'Active' } },
    { $group: { _id: '$subject', groups: { $sum: 1 }, members: { $sum: { $size: '$members' } } } },
    { $sort: { groups: -1, members: -1 } },
    { $limit: 8 },
  ]);

  const featured = await Group.find({ status: 'Active' })
    .populate('createdBy', 'name course avatarColor')
    .populate('members.user', 'name course skillLevel avatarColor')
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  res.status(200).json({
    success: true,
    data: {
      stats: { students, groups, sessions, resources },
      popularSubjects: popular.map((p) => ({ name: p._id, groups: p.groups, members: p.members })),
      featuredGroups: featured.map((g) => ({
        _id: g._id,
        name: g.name,
        subject: g.subject,
        topic: g.topic,
        course: g.course,
        skillLevel: g.skillLevel,
        schedule: g.schedule,
        memberCount: g.members.length,
        maxCapacity: g.maxCapacity,
        createdBy: g.createdBy,
      })),
    },
  });
});

module.exports = { getSubjects, getPublicStats };
