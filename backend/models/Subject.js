const mongoose = require('mongoose');

/**
 * Subject model - collection: subjects
 * Master list of subjects/courses used to populate the filter dropdowns.
 */
const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      default: '',
    },
    topics: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
