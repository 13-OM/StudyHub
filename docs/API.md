# StudyHub — REST API Reference

Base URL: `http://localhost:5000/api`

All requests and responses are JSON. Protected routes need the JWT token that is
returned by `/auth/login` or `/auth/register`:

```
Authorization: Bearer <token>
```

Every response follows one of these two shapes:

```json
{ "success": true,  "message": "…", "data": { … } }
{ "success": false, "message": "…", "errors": ["optional field errors"] }
```

| Status | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation error / invalid request |
| 401 | Not authenticated (missing or invalid token) |
| 403 | Authenticated but not allowed (e.g. not the group owner) |
| 404 | Resource not found |
| 500 | Server error (details are never leaked to the client) |

---

## 1. Authentication

### POST `/api/auth/register`

```json
{
  "name": "Om Bhatt",
  "email": "om@college.edu",
  "password": "studyhub123",
  "confirmPassword": "studyhub123",
  "course": "Computer Engineering",
  "skillLevel": "Intermediate",
  "interests": "React, DBMS"
}
```

**201**

```json
{
  "success": true,
  "message": "Registration successful. Welcome to StudyHub!",
  "data": {
    "user": { "_id": "…", "name": "Om Bhatt", "email": "om@college.edu", "course": "Computer Engineering", "skillLevel": "Intermediate", "interests": ["React", "DBMS"] },
    "token": "eyJhbGciOi…"
  }
}
```

**400** — email already registered / password shorter than 6 characters /
passwords do not match / invalid email.

### POST `/api/auth/login`

```json
{ "email": "om@studyhub.com", "password": "studyhub123" }
```

**200** → `{ user, token }` · **401** → `{"message": "Invalid email or password."}`

### GET `/api/auth/me` 🔒
Returns the logged in user. Used on page refresh to restore the session.

### POST `/api/auth/logout` 🔒
Stateless: the client deletes the token. Exists so the frontend has a clean call.

---

## 2. Users

### GET `/api/users/profile` 🔒
```json
{
  "data": {
    "user": { "name": "Om Bhatt", "course": "Computer Engineering", "skillLevel": "Advanced", "interests": ["…"] },
    "stats": {
      "groupsCreated": 2, "groupsJoined": 2, "totalGroups": 4,
      "sessionsCompleted": 5, "sessionsAttended": 5, "sessionsMissed": 0,
      "attendanceRate": 100, "resourcesShared": 7
    }
  }
}
```

### PUT `/api/users/profile` 🔒
Any subset of `{ name, email, course, skillLevel, interests, bio, password }`.
Changing the email to an address that already exists → **400**.

### GET `/api/users/:id` 🔒
Public profile of another student (name, course, skill level, avatar colour).
The password hash is never included.

---

## 3. Study groups

### GET `/api/groups` 🔒

| Query | Type | Description |
|---|---|---|
| `q` | string | Search in name, subject, topic, description, course |
| `course` | string | Exact course |
| `subject` | string | Exact subject |
| `topic` | string | Partial topic match |
| `skillLevel` | string | Beginner / Intermediate / Advanced |
| `day` | string | Monday … Sunday |
| `time` | string | Morning / Afternoon / Evening |
| `available` | `true` | Only groups that still have free seats |
| `sort` | `newest` \| `members` \| `seats` \| `name` | Sorting |
| `page`, `limit` | number | Pagination (default page 1, limit 12, max 50) |

```json
{
  "success": true,
  "count": 9,
  "total": 9,
  "page": 1,
  "pages": 1,
  "data": {
    "groups": [
      {
        "_id": "…",
        "name": "React Study Circle",
        "subject": "Web Application Development",
        "topic": "React Hooks & State Management",
        "skillLevel": "Intermediate",
        "maxCapacity": 8,
        "schedule": { "day": "Monday", "time": "Evening" },
        "memberCount": 4,
        "seatsLeft": 4,
        "isFull": false,
        "createdBy": { "_id": "…", "name": "Om Bhatt", "course": "Computer Engineering" },
        "members": [{ "user": { "_id": "…", "name": "Om Bhatt" }, "role": "Owner", "joinedAt": "…" }],
        "viewer": { "isOwner": false, "isMember": false, "requestStatus": null, "canJoin": true }
      }
    ]
  }
}
```

`viewer` lets the UI pick the right button: **Join / Request pending / Member / Group full**.

### POST `/api/groups` 🔒

```json
{
  "name": "React Study Circle",
  "subject": "Web Application Development",
  "topic": "React Hooks & State Management",
  "course": "Computer Engineering",
  "skillLevel": "Intermediate",
  "maxCapacity": 8,
  "schedule": { "day": "Monday", "time": "Evening" },
  "description": "A weekly hands-on circle for students learning React. (min 20 characters)"
}
```

**201** → the created group. The creator is added automatically as `Owner`.

### GET `/api/groups/my` 🔒
```json
{ "data": { "created": [...], "joined": [...], "pendingRequests": [...] } }
```
Each group also carries `nextSession` (the nearest upcoming session) for the "My Groups" cards.

### GET `/api/groups/:id` 🔒
Group details + `viewer` permissions. **404** if the group does not exist.

### PUT `/api/groups/:id` 🔒 (owner)
Editable: name, subject, topic, course, skillLevel, maxCapacity, schedule,
description, status. Reducing capacity below the current member count → **400**.

### DELETE `/api/groups/:id` 🔒 (owner)
Also deletes the group's sessions, attendance, resources, announcements and join
requests (cascade delete).

---

## 4. Join requests

### POST `/api/groups/:id/join` 🔒
```json
{ "message": "Hi! I am in the same division. (optional, max 200 chars)" }
```

| Situation | Response |
|---|---|
| New request | **201** "Join request sent successfully…" |
| Already pending | **400** "Your join request is already pending approval" |
| Already a member | **400** "You are already a member of this group" |
| Owner of the group | **400** "You are the owner of this group" |
| Group is full | **400** "This group has reached its maximum capacity" |
| Previously rejected | **200** the request is set back to Pending |

### GET `/api/groups/:id/requests` 🔒 (owner)
```json
{ "count": 3, "pendingCount": 2, "data": { "requests": [ { "_id": "…", "user": { "name": "Isha Joshi", "course": "…", "skillLevel": "Intermediate" }, "message": "…", "status": "Pending", "createdAt": "…" } ] } }
```

### PUT `/api/requests/:id/approve` 🔒 (owner)
Adds the student to `group.members` and marks the request **Approved**.
**400** when the group is full · **403** when the caller is not the owner.

### PUT `/api/requests/:id/reject` 🔒 (owner)
Marks the request **Rejected**. The student may request again later.

### GET `/api/requests/my` 🔒 · GET `/api/requests/incoming` 🔒
Requests sent by me / every request for the groups I own (used by the
notification bell, which returns a `pendingCount`).

---

## 5. Members

### GET `/api/groups/:id/members` 🔒 (member)
```json
{ "count": 4, "data": { "members": [ { "user": { "name": "Om Bhatt", "email": "…", "course": "…", "skillLevel": "Advanced" }, "role": "Owner", "joinedAt": "…" } ] } }
```
Non-members receive **403 Access denied**.

### DELETE `/api/groups/:id/members/:userId` 🔒 (owner)
Removes a member. **400** "You cannot remove yourself from the group" ·
**400** "The owner cannot be removed from the group" · **404** when the user is not a member.

---

## 6. Sessions

### GET `/api/groups/:id/sessions` 🔒 (member)
```json
{
  "count": 3,
  "data": {
    "sessions": [ { "_id": "…", "title": "React Hooks Deep Dive", "date": "2026-10-03T00:00:00.000Z", "startTime": "18:00", "duration": 90, "status": "Upcoming", "learningObjective": "…", "agenda": ["useState basics", "…"], "topics": ["useState"], "presentCount": 0 } ],
    "stats": { "total": 3, "upcoming": 1, "completed": 2, "cancelled": 0 }
  }
}
```

### POST `/api/groups/:id/sessions` 🔒 (owner)
```json
{
  "title": "React Hooks Deep Dive",
  "learningObjective": "Understand useState and useEffect by building a small counter.",
  "agenda": "useState basics\nuseEffect and dependencies\nCustom hooks\nPractical exercise",
  "topics": "useState, useEffect, Custom Hooks",
  "expectedOutcome": "Every member can build a component that fetches data.",
  "date": "2026-10-03",
  "startTime": "18:00",
  "duration": 90,
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "notes": "Bring laptops"
}
```
`agenda` and `topics` accept either a newline/comma string **or** a JSON array.
The backend strips manual numbering (`1. `) and stores a clean list.

### GET `/api/sessions/my` 🔒
```json
{ "data": { "sessions": [...], "upcoming": [...], "completed": [...], "cancelled": [...] } }
```

### GET `/api/sessions/:id` 🔒 (member)
Returns `{ session, attendance }` — the complete session plan and the attendance records.

### PUT `/api/sessions/:id` 🔒 (owner)
Every field is optional, so "Mark complete" can send `{"status":"Completed"}`.

### DELETE `/api/sessions/:id` 🔒 (owner)
Deletes the session and its attendance records.

---

## 7. Attendance

### POST `/api/sessions/:id/attendance` 🔒 (owner)
```json
{
  "records": [
    { "user": "64f…", "status": "Present" },
    { "user": "64f…", "status": "Absent" }
  ]
}
```
Upserts one record per (session, user) — calling it again simply updates the
values (`session.attendanceMarked` becomes `true`). A user who is not a member of
the group → **400**.

### GET `/api/sessions/:id/attendance` 🔒 (member)
```json
{
  "data": {
    "rows": [ { "user": { "name": "Om Bhatt" }, "role": "Owner", "status": "Present" } ],
    "summary": { "totalMembers": 4, "present": 3, "absent": 1, "unmarked": 0, "percentage": 75 }
  }
}
```
One row per member, so the marking table is always complete.

### GET `/api/groups/:id/attendance` 🔒 (member)
```json
{
  "data": {
    "members": [ { "user": { "name": "Aarav Desai" }, "role": "Member", "sessionsAttended": 1, "sessionsMissed": 1, "attendanceRate": 50 } ],
    "overall": { "completedSessions": 2, "markedRecords": 6, "presentRecords": 5, "attendanceRate": 83 }
  }
}
```

### GET `/api/attendance/my` 🔒
Personal report: `records` (session-wise), `history` (completed sessions with
`presentCount` / `totalMembers`) and `summary` (`sessionsAttended`,
`sessionsMissed`, `attendanceRate`).

---

## 8. Resources

### GET `/api/groups/:id/resources` 🔒 (member)
Optional `?type=Video` and `?q=javascript`.

### POST `/api/groups/:id/resources` 🔒 (member)
```json
{
  "title": "React Hooks Official Notes",
  "type": "Notes",
  "url": "https://react.dev/reference/react/hooks",
  "description": "Official documentation for every built-in hook."
}
```
`type` must be one of **PDF, Article, Video, Website, Notes, Other** and `url`
must start with `http://` or `https://` — otherwise **400**.

### PUT `/api/resources/:id` 🔒 · DELETE `/api/resources/:id` 🔒
Allowed for the person who added the resource **or** the group owner.

### GET `/api/resources/my` 🔒
Resources from every group the student belongs to (+ the distinct `types` list for the filter chips).

---

## 9. Announcements

### GET `/api/groups/:id/announcements` 🔒 (member)

### POST `/api/groups/:id/announcements` 🔒 (owner)
```json
{ "title": "Tomorrow's session has been moved to 6 PM", "message": "…" }
```

### PUT `/api/announcements/:id` 🔒 · DELETE `/api/announcements/:id` 🔒 (owner)

### GET `/api/announcements/my` 🔒
Feed of announcements from all of the student's groups.

---

## 10. Statistics

### GET `/api/stats/dashboard` 🔒
```json
{
  "data": {
    "stats": { "totalGroups": 9, "myGroups": 4, "groupsCreated": 2, "groupsJoined": 2, "groupsThisMonth": 4,
               "upcomingSessions": 4, "completedSessions": 5, "attendanceRate": 100,
               "sessionsAttended": 5, "pendingRequests": 3, "resourcesShared": 7, "announcements": 5 },
    "upcomingSessions": [ { "title": "React Hooks Deep Dive", "group": { "name": "React Study Circle" } } ],
    "recommendedGroups": [ { "name": "AI & ML Beginners", "memberCount": 2, "viewer": { "canJoin": true } } ],
    "recentActivity": [ { "type": "request", "title": "Isha Joshi requested to join", "subtitle": "React Study Circle • Pending", "date": "…" } ]
  }
}
```

### GET `/api/stats/history` 🔒
Completed + cancelled sessions of my groups.
Filters: `?from=2026-09-01&to=2026-10-31&groupId=<id>&subject=<name>`.
Each row includes `presentCount`, `totalMembers` (→ "5/6 attended") and `myStatus`.

### GET `/api/stats/subjects` (public)
Subject catalogue with `groupCount`, plus `courses` and `subjectsInUse` (used to fill filters).

### GET `/api/stats/public` (public)
Landing page numbers: total students, groups, sessions, resources, popular
subjects and the six most recent groups.

### GET `/api/health` (public)
```json
{ "success": true, "status": "ok", "database": "connected", "time": "…" }
```
