const mongoose = require('mongoose');
const { SESSION_STATUS } = require('../utils/constants');

/**
 * Session model - collection: sessions
 * group -> Group
 * A session is a planned study meeting for one study group.
 */
const sessionSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    learningObjective: {
      type: String,
      default: '',
      maxlength: [300, 'Learning objective cannot exceed 300 characters'],
    },
    agenda: {
      type: [String], // e.g. ["1. useState", "2. useEffect"]
      default: [],
    },
    topics: {
      type: [String],
      default: [],
    },
    expectedOutcome: {
      type: String,
      default: '',
      maxlength: [300, 'Expected outcome cannot exceed 300 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Session date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format'],
    },
    duration: {
      type: Number, // minutes
      required: [true, 'Duration is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      max: [480, 'Duration cannot exceed 480 minutes'],
    },
    meetingLink: {
      type: String,
      default: '',
      validate: {
        validator: (value) => !value || /^https?:\/\/.+/i.test(value),
        message: 'Meeting link must be a valid URL',
      },
    },
    status: {
      type: String,
      enum: { values: SESSION_STATUS, message: 'Invalid session status' },
      default: 'Upcoming',
    },
    notes: {
      type: String,
      default: '',
      maxlength: [400, 'Notes cannot exceed 400 characters'],
    },
    attendanceMarked: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
