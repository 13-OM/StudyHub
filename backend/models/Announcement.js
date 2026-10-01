const mongoose = require('mongoose');

/**
 * Announcement model - collection: announcements
 * group -> Group, postedBy -> User
 * A notice posted by the group owner for all members.
 */
const announcementSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    message: {
      type: String,
      required: [true, 'Announcement message is required'],
      minlength: [5, 'Message must be at least 5 characters'],
      maxlength: [800, 'Message cannot exceed 800 characters'],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
