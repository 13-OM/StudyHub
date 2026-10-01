/**
 * StudyHub - end to end API test script.
 * Usage:  node utils/apiTest.js   (backend must be running on PORT 5000)
 *
 * It follows the exact demonstration flow of the project, printing PASS/FAIL
 * for every API call. Handy for the viva and for regression checking.
 */
const BASE = process.env.API_URL || 'http://localhost:5000/api';

let passed = 0;
let failed = 0;

const log = (ok, label, extra = '') => {
  if (ok) {
    passed++;
    console.log(`  ✅ ${label}${extra ? '  ' + extra : ''}`);
  } else {
    failed++;
    console.log(`  ❌ ${label}${extra ? '  ' + extra : ''}`);
  }
};

const api = async (method, path, { token, body } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let json = null;
  try {
    json = await res.json();
  } catch (e) {
    json = {};
  }
  return { status: res.status, body: json };
};

const run = async () => {
  console.log(`\n🧪 StudyHub API test suite -> ${BASE}\n`);

  // ---------------------------------------------------------------- health
  console.log('— Health —');
  const health = await api('GET', '/health');
  log(health.status === 200 && health.body.status === 'ok', 'GET /api/health', `db=${health.body.database}`);

  // ---------------------------------------------------------------- auth
  console.log('\n— Authentication —');
  const ownerLogin = await api('POST', '/auth/login', {
    body: { email: 'om@studyhub.com', password: 'studyhub123' },
  });
  log(ownerLogin.status === 200 && !!ownerLogin.body.data?.token, 'POST /auth/login (owner)', ownerLogin.body.message);
  const ownerToken = ownerLogin.body.data?.token;
  const ownerId = ownerLogin.body.data?.user?._id;

  const badLogin = await api('POST', '/auth/login', {
    body: { email: 'om@studyhub.com', password: 'wrongpassword' },
  });
  log(badLogin.status === 401, 'Wrong password rejected', `HTTP ${badLogin.status}: ${badLogin.body.message}`);

  const newEmail = `tester${Date.now()}@studyhub.com`;
  const register = await api('POST', '/auth/register', {
    body: {
      name: 'Viva Tester',
      email: newEmail,
      password: 'test1234',
      confirmPassword: 'test1234',
      course: 'Computer Engineering',
      skillLevel: 'Beginner',
      interests: 'Data Structures, Operating Systems',
    },
  });
  log(register.status === 201 && !!register.body.data?.token, 'POST /auth/register', register.body.message);
  const newUserToken = register.body.data?.token;
  const newUserId = register.body.data?.user?._id;

  const dupRegister = await api('POST', '/auth/register', {
    body: {
      name: 'Viva Tester',
      email: newEmail,
      password: 'test1234',
      confirmPassword: 'test1234',
      course: 'Computer Engineering',
    },
  });
  log(dupRegister.status === 400, 'Duplicate email blocked', dupRegister.body.message);

  const weakPassword = await api('POST', '/auth/register', {
    body: { name: 'Weak User', email: `weak${Date.now()}@x.com`, password: '123', confirmPassword: '123', course: 'CE' },
  });
  log(weakPassword.status === 400, 'Weak password rejected', weakPassword.body.message);

  const mismatch = await api('POST', '/auth/register', {
    body: { name: 'No Match', email: `mismatch${Date.now()}@x.com`, password: 'test1234', confirmPassword: 'test12345', course: 'CE' },
  });
  log(mismatch.status === 400, 'Password confirmation validated', mismatch.body.message);

  const me = await api('GET', '/auth/me', { token: ownerToken });
  log(me.status === 200 && me.body.data.user.email === 'om@studyhub.com', 'GET /auth/me');

  const noToken = await api('GET', '/stats/dashboard');
  log(noToken.status === 401, 'Protected route without token -> 401', noToken.body.message);

  const badToken = await api('GET', '/stats/dashboard', { token: 'not.a.real.token' });
  log(badToken.status === 401, 'Invalid token rejected -> 401', badToken.body.message);

  // ---------------------------------------------------------------- groups
  console.log('\n— Study groups (browse / search / filter) —');
  const allGroups = await api('GET', '/groups', { token: newUserToken });
  log(allGroups.status === 200 && allGroups.body.total > 0, 'GET /groups', `${allGroups.body.total} groups found`);

  const search = await api('GET', '/groups?q=react', { token: newUserToken });
  log(search.status === 200 && search.body.data.groups.some((g) => /react/i.test(g.name)), 'Search ?q=react', `${search.body.total} result(s)`);

  const filterSubject = await api('GET', '/groups?subject=Data%20Structures', { token: newUserToken });
  log(filterSubject.status === 200 && filterSubject.body.data.groups.every((g) => g.subject === 'Data Structures'), 'Filter by subject', `${filterSubject.body.total} result(s)`);

  const filterSkill = await api('GET', '/groups?skillLevel=Beginner', { token: newUserToken });
  log(filterSkill.status === 200 && filterSkill.body.data.groups.every((g) => g.skillLevel === 'Beginner'), 'Filter by skill level', `${filterSkill.body.total} result(s)`);

  const filterSchedule = await api('GET', '/groups?day=Monday&time=Evening', { token: newUserToken });
  log(filterSchedule.status === 200 && filterSchedule.body.data.groups.every((g) => g.schedule.day === 'Monday'), 'Filter by schedule', `${filterSchedule.body.total} result(s)`);

  const filterAvailable = await api('GET', '/groups?available=true', { token: newUserToken });
  log(filterAvailable.status === 200 && filterAvailable.body.data.groups.every((g) => !g.isFull), 'Filter available capacity', `${filterAvailable.body.total} result(s)`);

  const sortMembers = await api('GET', '/groups?sort=members', { token: newUserToken });
  const counts = sortMembers.body.data.groups.map((g) => g.memberCount);
  log(sortMembers.status === 200 && counts.every((v, i) => i === 0 || counts[i - 1] >= v), 'Sort by most members');

  const noResult = await api('GET', '/groups?q=zzzznotfound', { token: newUserToken });
  log(noResult.status === 200 && noResult.body.total === 0, 'Empty result set handled', `${noResult.body.total} groups`);

  const invalidGroup = await api('POST', '/groups', {
    token: ownerToken,
    body: { name: 'A', subject: '', topic: '', course: '', skillLevel: 'Expert', maxCapacity: 1, schedule: { day: 'Funday', time: 'Night' }, description: 'short' },
  });
  log(invalidGroup.status === 400 && invalidGroup.body.errors?.length >= 5, 'Create group validation', `${invalidGroup.body.errors?.length} field errors`);

  const createdGroup = await api('POST', '/groups', {
    token: newUserToken,
    body: {
      name: 'Viva Demo Group',
      subject: 'Operating Systems',
      topic: 'Threads & Concurrency',
      course: 'Computer Engineering',
      skillLevel: 'Intermediate',
      maxCapacity: 5,
      schedule: { day: 'Saturday', time: 'Evening' },
      description: 'A temporary group created by the automated API test to verify group creation and CRUD operations.',
    },
  });
  log(createdGroup.status === 201, 'POST /groups creates a group', createdGroup.body.message);
  const demoGroupId = createdGroup.body.data?.group?._id;
  log(createdGroup.body.data?.group?.viewer?.isOwner === true, 'Creator becomes owner automatically');

  const groupDetail = await api('GET', `/groups/${demoGroupId}`, { token: newUserToken });
  log(groupDetail.status === 200 && groupDetail.body.data.group.memberCount === 1, 'GET /groups/:id');

  const updatedGroup = await api('PUT', `/groups/${demoGroupId}`, {
    token: newUserToken,
    body: { topic: 'Threads, Concurrency & Semaphores', maxCapacity: 8 },
  });
  log(updatedGroup.status === 200 && updatedGroup.body.data.group.maxCapacity === 8, 'PUT /groups/:id (owner)');

  const forbiddenUpdate = await api('PUT', `/groups/${demoGroupId}`, {
    token: ownerToken,
    body: { name: 'Hacked by another student' },
  });
  log(forbiddenUpdate.status === 403, 'Non-owner cannot edit group -> 403', forbiddenUpdate.body.message);

  // ---------------------------------------------------------------- join flow
  console.log('\n— Join request workflow —');
  const join = await api('POST', `/groups/${demoGroupId}/join`, {
    token: ownerToken,
    body: { message: 'Please add me to this group.' },
  });
  log(join.status === 201, 'POST /groups/:id/join', join.body.message);

  const duplicateJoin = await api('POST', `/groups/${demoGroupId}/join`, { token: ownerToken });
  log(duplicateJoin.status === 400, 'Duplicate join request blocked', duplicateJoin.body.message);

  const ownerJoinsOwn = await api('POST', `/groups/${demoGroupId}/join`, { token: newUserToken });
  log(ownerJoinsOwn.status === 400, 'Owner cannot join own group', ownerJoinsOwn.body.message);

  const requests = await api('GET', `/groups/${demoGroupId}/requests`, { token: newUserToken });
  log(requests.status === 200 && requests.body.count === 1, 'GET /groups/:id/requests (owner)');
  const requestId = requests.body.data?.requests?.[0]?._id;

  const requestsForbidden = await api('GET', `/groups/${demoGroupId}/requests`, { token: ownerToken });
  log(requestsForbidden.status === 403, 'Non-owner cannot view requests -> 403');

  const approve = await api('PUT', `/requests/${requestId}/approve`, { token: newUserToken });
  log(approve.status === 200, 'PUT /requests/:id/approve', approve.body.message);

  const members = await api('GET', `/groups/${demoGroupId}/members`, { token: newUserToken });
  log(members.status === 200 && members.body.count === 2, 'GET /groups/:id/members', `${members.body.count} members`);

  const memberDetail = await api('GET', `/groups/${demoGroupId}`, { token: ownerToken });
  log(memberDetail.body.data.group.viewer.isMember === true && memberDetail.body.data.group.viewer.isOwner === false,
    'Approved student now sees Member state');

  const removeMember = await api('DELETE', `/groups/${demoGroupId}/members/${ownerId}`, { token: newUserToken });
  log(removeMember.status === 200, 'DELETE /groups/:id/members/:userId', removeMember.body.message);

  const removeSelf = await api('DELETE', `/groups/${demoGroupId}/members/${newUserId}`, { token: newUserToken });
  log(removeSelf.status === 400, 'Owner cannot remove themselves', removeSelf.body.message);

  // rejection path on a seeded group (React Study Circle has pending requests)
  const reactGroups = await api('GET', '/groups?q=React%20Study%20Circle', { token: ownerToken });
  const reactId = reactGroups.body.data.groups[0]._id;
  const reactRequests = await api('GET', `/groups/${reactId}/requests`, { token: ownerToken });
  const pending = reactRequests.body.data.requests.find((r) => r.status === 'Pending');
  const reject = await api('PUT', `/requests/${pending._id}/reject`, { token: ownerToken });
  log(reject.status === 200, 'PUT /requests/:id/reject', reject.body.message);

  const newUserGetReact = await api('GET', `/groups/${reactId}`, { token: newUserToken });
  log(newUserGetReact.status === 200, 'Group detail visible to non-member');

  // ---------------------------------------------------------------- sessions + attendance
  console.log('\n— Sessions & attendance —');
  const sessionCreate = await api('POST', `/groups/${reactId}/sessions`, {
    token: ownerToken,
    body: {
      title: 'Viva Session On useEffect',
      learningObjective: 'Explain the dependency array with live examples.',
      agenda: '1. useEffect basics\n2. Dependency array\n3. Cleanup function',
      topics: 'useEffect, Cleanup',
      expectedOutcome: 'Members can explain when a cleanup function runs.',
      date: new Date(Date.now() + 6 * 86400000).toISOString(),
      startTime: '18:30',
      duration: 60,
      meetingLink: 'https://meet.google.com/viva-demo',
    },
  });
  log(sessionCreate.status === 201, 'POST /groups/:id/sessions', sessionCreate.body.message);
  const sessionId = sessionCreate.body.data?.session?._id;
  log(sessionCreate.body.data?.session?.agenda?.length === 3, 'Agenda stored as list', JSON.stringify(sessionCreate.body.data?.session?.agenda));

  const badSession = await api('POST', `/groups/${reactId}/sessions`, {
    token: ownerToken,
    body: { title: 'x', date: 'not-a-date', startTime: '99:99', duration: 5, meetingLink: 'notaurl' },
  });
  log(badSession.status === 400, 'Session validation (date/time/duration/url)');

  const nonOwnerSession = await api('POST', `/groups/${reactId}/sessions`, {
    token: newUserToken,
    body: { title: 'Should fail', date: new Date().toISOString(), startTime: '10:00', duration: 60 },
  });
  log(nonOwnerSession.status === 403, 'Non-owner cannot create session -> 403');

  const groupSessions = await api('GET', `/groups/${reactId}/sessions`, { token: ownerToken });
  log(groupSessions.status === 200 && groupSessions.body.count >= 4, 'GET /groups/:id/sessions', `${groupSessions.body.count} sessions`);

  const groupMembers = await api('GET', `/groups/${reactId}/members`, { token: ownerToken });
  const attendanceRecords = groupMembers.body.data.members.map((m, i) => ({
    user: m.user._id,
    status: i % 3 === 0 ? 'Absent' : 'Present',
  }));

  const markAttendance = await api('POST', `/sessions/${sessionId}/attendance`, {
    token: ownerToken,
    body: { records: attendanceRecords },
  });
  log(markAttendance.status === 200, 'POST /sessions/:id/attendance', markAttendance.body.message);

  const getAttendance = await api('GET', `/sessions/${sessionId}/attendance`, { token: ownerToken });
  log(getAttendance.status === 200 && getAttendance.body.data.rows.length === groupMembers.body.count,
    'GET /sessions/:id/attendance', `${getAttendance.body.data.summary.present}/${getAttendance.body.data.summary.totalMembers} present`);

  const updateSession = await api('PUT', `/sessions/${sessionId}`, {
    token: ownerToken,
    body: { status: 'Completed', notes: 'Completed during the viva demonstration.' },
  });
  log(updateSession.status === 200 && updateSession.body.data.session.status === 'Completed', 'PUT /sessions/:id marks session complete');

  const sessionAttendanceForbidden = await api('POST', `/sessions/${sessionId}/attendance`, {
    token: newUserToken,
    body: { records: [{ user: ownerId, status: 'Present' }] },
  });
  log(sessionAttendanceForbidden.status === 403, 'Non-owner cannot mark attendance -> 403');

  const mySessions = await api('GET', '/sessions/my', { token: ownerToken });
  log(mySessions.status === 200 && mySessions.body.data.completed.length > 0, 'GET /sessions/my', `${mySessions.body.data.completed.length} completed`);

  const groupAttendance = await api('GET', `/groups/${reactId}/attendance`, { token: ownerToken });
  log(groupAttendance.status === 200 && groupAttendance.body.data.members.length > 0,
    'GET /groups/:id/attendance', `overall ${groupAttendance.body.data.overall.attendanceRate}%`);

  const myAttendance = await api('GET', '/attendance/my', { token: ownerToken });
  log(myAttendance.status === 200, 'GET /attendance/my', `rate ${myAttendance.body.data.summary.attendanceRate}%`);

  const history = await api('GET', '/stats/history', { token: ownerToken });
  log(history.status === 200 && history.body.count > 0, 'GET /stats/history', `${history.body.count} completed sessions`);
  const filteredHistory = await api('GET', `/stats/history?groupId=${reactId}`, { token: ownerToken });
  log(filteredHistory.status === 200 && filteredHistory.body.data.history.every((h) => h.group._id === reactId), 'History filter by group');

  // ---------------------------------------------------------------- resources
  console.log('\n— Resources —');
  const resourceCreate = await api('POST', `/groups/${reactId}/resources`, {
    token: ownerToken,
    body: { title: 'Viva React Notes', type: 'Notes', url: 'https://react.dev/learn', description: 'Official learning notes used in the demo.' },
  });
  log(resourceCreate.status === 201, 'POST /groups/:id/resources', resourceCreate.body.message);
  const resourceId = resourceCreate.body.data?.resource?._id;

  const badResource = await api('POST', `/groups/${reactId}/resources`, {
    token: ownerToken,
    body: { title: 'Bad', type: 'Ebook', url: 'not-a-url' },
  });
  log(badResource.status === 400, 'Resource URL + type validation', badResource.body.errors?.join(' | '));

  const resources = await api('GET', `/groups/${reactId}/resources`, { token: ownerToken });
  log(resources.status === 200 && resources.body.count >= 4, 'GET /groups/:id/resources', `${resources.body.count} resources`);

  const updateResource = await api('PUT', `/resources/${resourceId}`, {
    token: ownerToken,
    body: { title: 'Viva React Notes (updated)', type: 'Article', url: 'https://react.dev/learn', description: 'Updated during the API test.' },
  });
  log(updateResource.status === 200 && updateResource.body.data.resource.title.includes('updated'), 'PUT /resources/:id');

  const myResources = await api('GET', '/resources/my', { token: ownerToken });
  log(myResources.status === 200 && myResources.body.count > 0, 'GET /resources/my', `${myResources.body.count} resources`);

  const deleteResource = await api('DELETE', `/resources/${resourceId}`, { token: ownerToken });
  log(deleteResource.status === 200, 'DELETE /resources/:id');

  const notFoundResource = await api('DELETE', `/resources/${resourceId}`, { token: ownerToken });
  log(notFoundResource.status === 404, 'Deleting missing resource -> 404', notFoundResource.body.message);

  // ---------------------------------------------------------------- announcements
  console.log('\n— Announcements —');
  const announcementCreate = await api('POST', `/groups/${reactId}/announcements`, {
    token: ownerToken,
    body: { title: 'Demo announcement', message: 'This announcement was created by the automated API test suite.' },
  });
  log(announcementCreate.status === 201, 'POST /groups/:id/announcements', announcementCreate.body.message);
  const announcementId = announcementCreate.body.data?.announcement?._id;

  const nonOwnerAnnouncement = await api('POST', `/groups/${reactId}/announcements`, {
    token: newUserToken,
    body: { title: 'Nope', message: 'Members are not allowed to post announcements.' },
  });
  log(nonOwnerAnnouncement.status === 403, 'Member cannot post announcement -> 403');

  const updateAnnouncement = await api('PUT', `/announcements/${announcementId}`, {
    token: ownerToken,
    body: { title: 'Demo announcement (edited)', message: 'Edited during the automated API test run.' },
  });
  log(updateAnnouncement.status === 200, 'PUT /announcements/:id');

  const announcements = await api('GET', `/groups/${reactId}/announcements`, { token: ownerToken });
  log(announcements.status === 200 && announcements.body.count >= 3, 'GET /groups/:id/announcements', `${announcements.body.count} announcements`);

  const myAnnouncements = await api('GET', '/announcements/my', { token: ownerToken });
  log(myAnnouncements.status === 200 && myAnnouncements.body.count > 0, 'GET /announcements/my', `${myAnnouncements.body.count} items`);

  const deleteAnnouncement = await api('DELETE', `/announcements/${announcementId}`, { token: ownerToken });
  log(deleteAnnouncement.status === 200, 'DELETE /announcements/:id');

  // ---------------------------------------------------------------- users, stats
  console.log('\n— Profile & dashboard —');
  const profile = await api('GET', '/users/profile', { token: ownerToken });
  log(profile.status === 200 && profile.body.data.stats.totalGroups > 0, 'GET /users/profile', `${profile.body.data.stats.totalGroups} groups, ${profile.body.data.stats.attendanceRate}% attendance`);

  const updateProfile = await api('PUT', '/users/profile', {
    token: ownerToken,
    body: { bio: 'Final year Computer Engineering student. Interested in full stack development.', skillLevel: 'Advanced' },
  });
  log(updateProfile.status === 200 && updateProfile.body.data.user.bio.length > 0, 'PUT /users/profile');

  const invalidProfile = await api('PUT', '/users/profile', { token: ownerToken, body: { email: 'not-an-email' } });
  log(invalidProfile.status === 400, 'Profile email validation', invalidProfile.body.message);

  const dashboard = await api('GET', '/stats/dashboard', { token: ownerToken });
  const s = dashboard.body.data?.stats || {};
  log(dashboard.status === 200, 'GET /stats/dashboard',
    `groups=${s.myGroups} upcoming=${s.upcomingSessions} completed=${s.completedSessions} attendance=${s.attendanceRate}% pending=${s.pendingRequests}`);
  log(Array.isArray(dashboard.body.data?.upcomingSessions) && Array.isArray(dashboard.body.data?.recentActivity), 'Dashboard includes sessions + activity');

  const subjects = await api('GET', '/stats/subjects', { token: ownerToken });
  log(subjects.status === 200 && subjects.body.data.subjects.length >= 8, 'GET /stats/subjects', `${subjects.body.data.subjects.length} subjects`);

  const publicStats = await api('GET', '/stats/public');
  log(publicStats.status === 200 && publicStats.body.data.stats.students > 0, 'GET /stats/public', `${publicStats.body.data.stats.students} students, ${publicStats.body.data.stats.groups} groups`);

  const myGroups = await api('GET', '/groups/my', { token: ownerToken });
  log(myGroups.status === 200 && (myGroups.body.data.created.length > 0), 'GET /groups/my',
    `${myGroups.body.data.created.length} created, ${myGroups.body.data.joined.length} joined`);

  const incoming = await api('GET', '/requests/incoming', { token: ownerToken });
  log(incoming.status === 200 && typeof incoming.body.pendingCount === 'number', 'GET /requests/incoming', `${incoming.body.pendingCount} pending`);

  const myRequests = await api('GET', '/requests/my', { token: ownerToken });
  log(myRequests.status === 200, 'GET /requests/my', `${myRequests.body.count} requests`);

  // ---------------------------------------------------------------- errors
  console.log('\n— Error handling —');
  const notFoundRoute = await api('GET', '/this/route/does/not/exist', { token: ownerToken });
  log(notFoundRoute.status === 404, 'Unknown route -> 404', notFoundRoute.body.message);

  const badId = await api('GET', '/groups/12345', { token: ownerToken });
  log(badId.status === 400, 'Invalid ObjectId -> 400', badId.body.message);

  const missingGroup = await api('GET', '/groups/64b7f9c2f1a2b3c4d5e6f7a8', { token: ownerToken });
  log(missingGroup.status === 404, 'Missing group -> 404', missingGroup.body.message);

  const otherUserProfile = await api('GET', `/users/${ownerId}`, { token: newUserToken });
  log(otherUserProfile.status === 200 && !otherUserProfile.body.data.user.password, 'Password hash never returned');

  // ---------------------------------------------------------------- cleanup
  const deleteGroup = await api('DELETE', `/groups/${demoGroupId}`, { token: newUserToken });
  log(deleteGroup.status === 200, 'DELETE /groups/:id (owner)', deleteGroup.body.message);

  console.log(`\n──────────────────────────────────────────────`);
  console.log(`  RESULT:  ${passed} passed, ${failed} failed  (${passed + failed} checks)`);
  console.log(`──────────────────────────────────────────────\n`);

  process.exit(failed > 0 ? 1 : 0);
};

run().catch((err) => {
  console.error('\n💥 Test run crashed:', err.message);
  process.exit(1);
});
