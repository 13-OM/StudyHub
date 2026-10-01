const Group = require('../models/Group');

/**
 * Build a MongoDB filter object from the query string of GET /api/groups.
 * Supported: q (search), course, subject, topic, skillLevel, day, time,
 *            available (only groups with free seats), mine.
 */
const buildGroupFilter = (query, userId) => {
  const filter = {};

  // Full text search across name / subject / topic / description
  if (query.q && query.q.trim()) {
    const regex = new RegExp(escapeRegex(query.q.trim()), 'i');
    filter.$or = [
      { name: regex },
      { subject: regex },
      { topic: regex },
      { description: regex },
      { course: regex },
    ];
  }

  if (query.course) filter.course = query.course;
  if (query.subject) filter.subject = query.subject;
  if (query.topic) filter.topic = new RegExp(escapeRegex(query.topic), 'i');
  if (query.skillLevel) filter.skillLevel = query.skillLevel;
  if (query.day) filter['schedule.day'] = query.day;
  if (query.time) filter['schedule.time'] = query.time;

  // Groups that still have free seats
  if (query.available === 'true' && userId) {
    filter.$expr = { $lt: [{ $size: '$members' }, '$maxCapacity'] };
  }

  // Only groups created by me
  if (query.mine === 'true' && userId) {
    filter.createdBy = userId;
  }

  return filter;
};

/** Escape special characters so user input cannot break the regex. */
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Map the "sort" query value to a Mongoose sort object. */
const buildSort = (sort) => {
  switch (sort) {
    case 'members':
      return { membersCount: -1, createdAt: -1 };
    case 'seats':
      return { seatsLeft: -1, createdAt: -1 };
    case 'name':
      return { name: 1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
};

/**
 * Convert a group document into the shape the frontend expects and add
 * "viewer state" so a card knows which button to show
 * (Join / Pending / Member / Full).
 */
const formatGroup = (group, viewerId, requestStatusMap = {}) => {
  const memberCount = group.members ? group.members.length : 0;
  const isOwner = viewerId && group.createdBy
    ? (group.createdBy._id || group.createdBy).toString() === viewerId.toString()
    : false;
  const isMember = viewerId
    ? group.members.some((m) => (m.user._id || m.user).toString() === viewerId.toString())
    : false;
  const requestStatus = viewerId
    ? requestStatusMap[group._id.toString()] || null
    : null;

  return {
    ...group,
    memberCount,
    seatsLeft: Math.max(group.maxCapacity - memberCount, 0),
    isFull: memberCount >= group.maxCapacity,
    status: group.status || 'Active',
    viewer: {
      isOwner,
      isMember,
      requestStatus, // 'Pending' | 'Approved' | 'Rejected' | null
      canJoin: Boolean(viewerId) && !isOwner && !isMember && !requestStatus
        && memberCount < group.maxCapacity,
    },
  };
};

module.exports = { buildGroupFilter, buildSort, formatGroup, escapeRegex };
