/**
 * Shared enumerations used by Mongoose models and validators.
 * Keeping them in one place avoids "magic strings" inside controllers.
 */
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'];

const SESSION_STATUS = ['Upcoming', 'In Progress', 'Completed', 'Cancelled'];

const RESOURCE_TYPES = ['PDF', 'Article', 'Video', 'Website', 'Notes', 'Other'];

const REQUEST_STATUS = ['Pending', 'Approved', 'Rejected'];

const ATTENDANCE_STATUS = ['Present', 'Absent'];

module.exports = {
  SKILL_LEVELS,
  WEEK_DAYS,
  TIME_SLOTS,
  SESSION_STATUS,
  RESOURCE_TYPES,
  REQUEST_STATUS,
  ATTENDANCE_STATUS,
};
