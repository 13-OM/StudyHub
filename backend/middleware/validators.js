const { body, param, validationResult } = require('express-validator');
const {
  SKILL_LEVELS,
  WEEK_DAYS,
  TIME_SLOTS,
  SESSION_STATUS,
  RESOURCE_TYPES,
} = require('../utils/constants');

/**
 * runValidation - collects express-validator results.
 * Returns HTTP 400 with a list of readable field errors.
 */
const runValidation = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => e.msg);
  return res.status(400).json({
    success: false,
    message: errors[0], // first error is shown in the toast
    errors,
  });
};

// ------------------------- AUTH -------------------------
const registerRules = [
  body('name').trim().notEmpty().withMessage('Full name is required')
    .isLength({ min: 3, max: 60 }).withMessage('Name must be between 3 and 60 characters'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== undefined && value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  body('course').trim().notEmpty().withMessage('Course is required'),
  body('skillLevel').optional().isIn(SKILL_LEVELS).withMessage('Invalid skill level'),
  body('interests').optional(),
  runValidation,
];

const loginRules = [
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  runValidation,
];

const updateProfileRules = [
  body('name').optional().trim().isLength({ min: 3, max: 60 })
    .withMessage('Name must be between 3 and 60 characters'),
  body('email').optional().trim().isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('course').optional().trim().notEmpty().withMessage('Course cannot be empty'),
  body('skillLevel').optional().isIn(SKILL_LEVELS).withMessage('Invalid skill level'),
  body('bio').optional().isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters'),
  body('password').optional().isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
  runValidation,
];

// ------------------------- GROUPS -------------------------
const groupRules = [
  body('name').trim().notEmpty().withMessage('Group name is required')
    .isLength({ min: 3, max: 80 }).withMessage('Group name must be between 3 and 80 characters'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('course').trim().notEmpty().withMessage('Course is required'),
  body('skillLevel').notEmpty().withMessage('Skill level is required')
    .isIn(SKILL_LEVELS).withMessage('Skill level must be Beginner, Intermediate or Advanced'),
  body('maxCapacity').notEmpty().withMessage('Maximum capacity is required')
    .isInt({ min: 2, max: 50 }).withMessage('Capacity must be a number between 2 and 50'),
  body('schedule.day').notEmpty().withMessage('Preferred day is required')
    .isIn(WEEK_DAYS).withMessage('Please choose a valid day'),
  body('schedule.time').notEmpty().withMessage('Preferred time is required')
    .isIn(TIME_SLOTS).withMessage('Please choose a valid time slot'),
  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 600 })
    .withMessage('Description must be between 20 and 600 characters'),
  runValidation,
];

// ------------------------- SESSIONS -------------------------
const sessionRules = [
  body('title').trim().notEmpty().withMessage('Session title is required')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  body('date').notEmpty().withMessage('Session date is required')
    .isISO8601().withMessage('Please provide a valid date'),
  body('startTime').notEmpty().withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be HH:MM (24 hour)'),
  body('duration').notEmpty().withMessage('Duration is required')
    .isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('meetingLink').optional({ values: 'falsy' })
    .isURL({ require_protocol: true }).withMessage('Meeting link must be a valid URL'),
  body('status').optional().isIn(SESSION_STATUS).withMessage('Invalid session status'),
  body('agenda').optional(),
  body('topics').optional(),
  runValidation,
];

/**
 * Same rules as sessionRules but every field is optional, because a PUT
 * request may only change the status (e.g. "Mark as complete").
 */
const sessionUpdateRules = [
  body('title').optional().trim().isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('date').optional().isISO8601().withMessage('Please provide a valid date'),
  body('startTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Start time must be HH:MM (24 hour)'),
  body('duration').optional().isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('meetingLink').optional({ values: 'falsy' }).isURL({ require_protocol: true })
    .withMessage('Meeting link must be a valid URL'),
  body('status').optional().isIn(SESSION_STATUS).withMessage('Invalid session status'),
  body('agenda').optional(),
  body('topics').optional(),
  runValidation,
];

// ------------------------- ATTENDANCE -------------------------
const attendanceRules = [
  body('records').isArray({ min: 1 }).withMessage('Attendance records are required'),
  body('records.*.user').notEmpty().withMessage('Each record needs a user id')
    .isMongoId().withMessage('Invalid user id in attendance records'),
  body('records.*.status').notEmpty().withMessage('Each record needs a status')
    .isIn(['Present', 'Absent']).withMessage('Status must be Present or Absent'),
  runValidation,
];

// ------------------------- RESOURCES -------------------------
const resourceRules = [
  body('title').trim().notEmpty().withMessage('Resource title is required')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('type').notEmpty().withMessage('Resource type is required')
    .isIn(RESOURCE_TYPES).withMessage('Please select a valid resource type'),
  body('url').trim().notEmpty().withMessage('Resource URL is required')
    .isURL({ require_protocol: true }).withMessage('Please enter a valid URL starting with http:// or https://'),
  body('description').optional().isLength({ max: 300 })
    .withMessage('Description cannot exceed 300 characters'),
  runValidation,
];

// ------------------------- ANNOUNCEMENTS -------------------------
const announcementRules = [
  body('title').trim().notEmpty().withMessage('Announcement title is required')
    .isLength({ max: 120 }).withMessage('Title cannot exceed 120 characters'),
  body('message').trim().notEmpty().withMessage('Announcement message is required')
    .isLength({ min: 5, max: 800 }).withMessage('Message must be between 5 and 800 characters'),
  runValidation,
];

// ------------------------- COMMON -------------------------
const mongoIdParam = (name = 'id') => [
  param(name).isMongoId().withMessage('Invalid id in the URL'),
  runValidation,
];

module.exports = {
  runValidation,
  registerRules,
  loginRules,
  updateProfileRules,
  groupRules,
  sessionRules,
  sessionUpdateRules,
  attendanceRules,
  resourceRules,
  announcementRules,
  mongoIdParam,
};
