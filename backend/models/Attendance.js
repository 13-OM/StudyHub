const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../utils/constants');

/**
 * Attendance model - collection: attendances
 * session -> Session, user -> User, group -> Group
 * One attendance document per (session, user) pair.
 */
const attendanceSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
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
    status: {
      type: String,
      enum: { values: ATTENDANCE_STATUS, message: 'Invalid attendance status' },
      required: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ session: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
