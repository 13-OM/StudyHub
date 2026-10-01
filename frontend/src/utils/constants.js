/**
 * Frontend copies of the enums used by the backend.
 * They fill the dropdowns and decide badge colours.
 */
export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const WEEK_DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

export const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'];

export const SESSION_STATUS = ['Upcoming', 'In Progress', 'Completed', 'Cancelled'];

export const RESOURCE_TYPES = ['PDF', 'Article', 'Video', 'Website', 'Notes', 'Other'];

export const COURSES = [
  'Computer Engineering',
  'Information Technology',
  'Information and Communication Technology',
  'Electronics and Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other',
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'members', label: 'Most members' },
  { value: 'seats', label: 'Available seats' },
  { value: 'name', label: 'Group name (A–Z)' },
];
