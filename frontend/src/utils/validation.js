/**
 * validation.js — client side form validation.
 * The backend validates everything again; this layer only gives the user
 * instant feedback so they do not have to wait for a round trip.
 */
export const isEmail = (value = '') => /^\S+@\S+\.\S+$/.test(value.trim());

export const isUrl = (value = '') => /^https?:\/\/.+/i.test(value.trim());

export const required = (value) => (value === undefined || value === null || String(value).trim() === '');

/** Validate the registration form. Returns { field: message } pairs. */
export const validateRegister = (form) => {
  const errors = {};
  if (required(form.name)) errors.name = 'Full name is required';
  else if (form.name.trim().length < 3) errors.name = 'Name must be at least 3 characters';

  if (required(form.email)) errors.email = 'Email is required';
  else if (!isEmail(form.email)) errors.email = 'Enter a valid email address';

  if (required(form.password)) errors.password = 'Password is required';
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters';

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password';
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';

  if (required(form.course)) errors.course = 'Course is required';

  return errors;
};

export const validateLogin = (form) => {
  const errors = {};
  if (required(form.email)) errors.email = 'Email is required';
  else if (!isEmail(form.email)) errors.email = 'Enter a valid email address';
  if (required(form.password)) errors.password = 'Password is required';
  return errors;
};

/** Validate the create / edit group form. */
export const validateGroup = (form) => {
  const errors = {};
  if (required(form.name)) errors.name = 'Group name is required';
  else if (form.name.trim().length < 3) errors.name = 'Group name must be at least 3 characters';

  if (required(form.subject)) errors.subject = 'Subject is required';
  if (required(form.topic)) errors.topic = 'Topic is required';
  if (required(form.course)) errors.course = 'Course is required';
  if (required(form.skillLevel)) errors.skillLevel = 'Skill level is required';

  const capacity = Number(form.maxCapacity);
  if (required(form.maxCapacity)) errors.maxCapacity = 'Maximum capacity is required';
  else if (Number.isNaN(capacity) || capacity < 2 || capacity > 50) {
    errors.maxCapacity = 'Capacity must be between 2 and 50';
  }

  if (required(form.day)) errors.day = 'Preferred day is required';
  if (required(form.time)) errors.time = 'Preferred time is required';

  if (required(form.description)) errors.description = 'Description is required';
  else if (form.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters';
  } else if (form.description.trim().length > 600) {
    errors.description = 'Description cannot exceed 600 characters';
  }

  return errors;
};

/** Validate the create / edit session form (including the session plan). */
export const validateSession = (form) => {
  const errors = {};
  if (required(form.title)) errors.title = 'Session title is required';
  else if (form.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';

  if (required(form.date)) errors.date = 'Session date is required';

  if (required(form.startTime)) errors.startTime = 'Start time is required';

  const duration = Number(form.duration);
  if (required(form.duration)) errors.duration = 'Duration is required';
  else if (Number.isNaN(duration) || duration < 15 || duration > 480) {
    errors.duration = 'Duration must be between 15 and 480 minutes';
  }

  if (form.meetingLink && !isUrl(form.meetingLink)) {
    errors.meetingLink = 'Enter a valid link starting with http:// or https://';
  }

  return errors;
};

export const validateResource = (form) => {
  const errors = {};
  if (required(form.title)) errors.title = 'Resource title is required';
  if (required(form.type)) errors.type = 'Please select a resource type';
  if (required(form.url)) errors.url = 'Resource URL is required';
  else if (!isUrl(form.url)) errors.url = 'Enter a valid URL starting with http:// or https://';
  return errors;
};

export const validateAnnouncement = (form) => {
  const errors = {};
  if (required(form.title)) errors.title = 'Announcement title is required';
  if (required(form.message)) errors.message = 'Announcement message is required';
  else if (form.message.trim().length < 5) errors.message = 'Message must be at least 5 characters';
  return errors;
};

export const validateProfile = (form) => {
  const errors = {};
  if (required(form.name)) errors.name = 'Full name is required';
  else if (form.name.trim().length < 3) errors.name = 'Name must be at least 3 characters';
  if (required(form.email)) errors.email = 'Email is required';
  else if (!isEmail(form.email)) errors.email = 'Enter a valid email address';
  if (required(form.course)) errors.course = 'Course is required';
  if (form.password && form.password.length < 6) {
    errors.password = 'New password must be at least 6 characters';
  }
  if (form.password && form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
};

/** True when the errors object has no keys. */
export const isValid = (errors) => Object.keys(errors).length === 0;
