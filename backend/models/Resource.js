const mongoose = require('mongoose');
const { RESOURCE_TYPES } = require('../utils/constants');

/**
 * Resource model - collection: resources
 * group -> Group, addedBy -> User
 * A study material shared inside one group.
 */
const resourceSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    type: {
      type: String,
      enum: { values: RESOURCE_TYPES, message: 'Invalid resource type' },
      required: [true, 'Resource type is required'],
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      validate: {
        validator: (value) => /^https?:\/\/.+/i.test(value),
        message: 'Please provide a valid URL (starting with http:// or https://)',
      },
    },
    description: {
      type: String,
      default: '',
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
