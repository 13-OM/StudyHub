/**
 * services/index.js
 * One module per backend resource. Each function returns the parsed JSON
 * response, and the component layer decides what to do with it.
 */
import api, { buildQuery } from './api';

/* ------------------------------- Auth ------------------------------- */
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

/* ------------------------------ Users ------------------------------ */
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getUser: (id) => api.get(`/users/${id}`),
};

/* ------------------------------ Groups ----------------------------- */
export const groupService = {
  list: (filters = {}) => api.get(`/groups${buildQuery(filters)}`),
  get: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  update: (id, data) => api.put(`/groups/${id}`, data),
  remove: (id) => api.delete(`/groups/${id}`),
  myGroups: () => api.get('/groups/my'),
  members: (id) => api.get(`/groups/${id}/members`),
  removeMember: (groupId, userId) => api.delete(`/groups/${groupId}/members/${userId}`),
  attendance: (id) => api.get(`/groups/${id}/attendance`),
};

/* -------------------------- Join requests -------------------------- */
export const requestService = {
  create: (groupId, message) => api.post(`/groups/${groupId}/join`, { message }),
  forGroup: (groupId) => api.get(`/groups/${groupId}/requests`),
  approve: (requestId) => api.put(`/requests/${requestId}/approve`),
  reject: (requestId) => api.put(`/requests/${requestId}/reject`),
  mine: () => api.get('/requests/my'),
  incoming: () => api.get('/requests/incoming'),
};

/* ----------------------------- Sessions ---------------------------- */
export const sessionService = {
  forGroup: (groupId) => api.get(`/groups/${groupId}/sessions`),
  get: (id) => api.get(`/sessions/${id}`),
  create: (groupId, data) => api.post(`/groups/${groupId}/sessions`, data),
  update: (id, data) => api.put(`/sessions/${id}`, data),
  remove: (id) => api.delete(`/sessions/${id}`),
  mine: () => api.get('/sessions/my'),
  attendance: (id) => api.get(`/sessions/${id}/attendance`),
  markAttendance: (id, records) => api.post(`/sessions/${id}/attendance`, { records }),
};

/* ---------------------------- Attendance --------------------------- */
export const attendanceService = {
  mine: () => api.get('/attendance/my'),
};

/* ----------------------------- Resources --------------------------- */
export const resourceService = {
  forGroup: (groupId, filters = {}) => api.get(`/groups/${groupId}/resources${buildQuery(filters)}`),
  create: (groupId, data) => api.post(`/groups/${groupId}/resources`, data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  remove: (id) => api.delete(`/resources/${id}`),
  mine: () => api.get('/resources/my'),
};

/* --------------------------- Announcements ------------------------- */
export const announcementService = {
  forGroup: (groupId) => api.get(`/groups/${groupId}/announcements`),
  create: (groupId, data) => api.post(`/groups/${groupId}/announcements`, data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  remove: (id) => api.delete(`/announcements/${id}`),
  mine: () => api.get('/announcements/my'),
};

/* ------------------------------ Stats ------------------------------ */
export const statsService = {
  dashboard: () => api.get('/stats/dashboard'),
  history: (filters = {}) => api.get(`/stats/history${buildQuery(filters)}`),
  subjects: () => api.get('/stats/subjects'),
  publicStats: () => api.get('/stats/public'),
};
