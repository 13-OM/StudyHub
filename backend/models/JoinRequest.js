const mongoose = require('mongoose');
const { REQUEST_STATUS } = require('../utils/constants');

/**
 * JoinRequest model - collection: joinrequests
 * group -> Group, user -> User
 * One request document per (group, user) pair - enforced by the unique index.
 */
const joinRequestSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      default: '',
      maxlength: [200, 'Message cannot exceed 200 characters'],
    },
    status: {
      type: String,
      enum: { values: REQUEST_STATUS, message: 'Invalid request status' },
      default: 'Pending',
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    respondedAt: Date,
  },
  { timestamps: true }
);

joinRequestSchema.index({ group: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
