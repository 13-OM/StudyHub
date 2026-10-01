const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { SKILL_LEVELS } = require('../utils/constants');

/**
 * User model - collection: users
 * Stores student account details. Passwords are NEVER stored in plain text;
 * a bcrypt hash is saved in the "password" field.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never return the hash unless explicitly asked
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
    },
    skillLevel: {
      type: String,
      enum: { values: SKILL_LEVELS, message: 'Invalid skill level' },
      default: 'Beginner',
    },
    interests: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: '',
      maxlength: [300, 'Bio cannot exceed 300 characters'],
    },
    // Random tailwind-like colour used to draw the avatar circle
    avatarColor: {
      type: String,
      default: '#4f46e5',
    },
  },
  { timestamps: true }
);

// ---- Middleware: hash the password before saving ----
// NOTE: this hook is async, so we simply return (Mongoose 8 does not pass "next").
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---- Instance method: compare a plain password with the stored hash ----
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ---- Virtual: initials used by the avatar component ----
userSchema.virtual('initials').get(function () {
  return this.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
