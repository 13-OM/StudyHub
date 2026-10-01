const mongoose = require('mongoose');
const { SKILL_LEVELS, WEEK_DAYS, TIME_SLOTS } = require('../utils/constants');

/**
 * Member sub-document.
 * A group stores its members inside the group document.
 * role = 'Owner' for the creator, 'Member' for everybody else.
 */
const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['Owner', 'Member'], default: 'Member' },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Group model - collection: groups
 * createdBy -> User (owner)
 * members   -> [User]
 */
const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      minlength: [3, 'Group name must be at least 3 characters'],
      maxlength: [80, 'Group name cannot exceed 80 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    skillLevel: {
      type: String,
      enum: { values: SKILL_LEVELS, message: 'Invalid skill level' },
      required: [true, 'Skill level is required'],
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Maximum capacity is required'],
      min: [2, 'Capacity must be at least 2'],
      max: [50, 'Capacity cannot exceed 50'],
    },
    schedule: {
      day: {
        type: String,
        enum: { values: WEEK_DAYS, message: 'Invalid day' },
        required: [true, 'Preferred day is required'],
      },
      time: {
        type: String,
        enum: { values: TIME_SLOTS, message: 'Invalid time slot' },
        required: [true, 'Preferred time is required'],
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [600, 'Description cannot exceed 600 characters'],
    },
    status: {
      type: String,
      enum: ['Active', 'Archived'],
      default: 'Active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
  },
  { timestamps: true }
);

// Text index so the search box can search name/subject/topic/description
groupSchema.index({ name: 'text', subject: 'text', topic: 'text', description: 'text' });

// ---- Helpers used by controllers and the frontend ----
groupSchema.virtual('memberCount').get(function () {
  return this.members ? this.members.length : 0;
});

groupSchema.virtual('seatsLeft').get(function () {
  return Math.max(this.maxCapacity - this.memberCount, 0);
});

groupSchema.virtual('isFull').get(function () {
  return this.memberCount >= this.maxCapacity;
});

groupSchema.set('toJSON', { virtuals: true });
groupSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Group', groupSchema);
