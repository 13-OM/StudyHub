# 🎓 StudyHub — Study Group Formation & Management Platform

> **Find. Connect. Learn. Together.**
>
> A full-stack web application where college students create study groups, schedule
> collaborative sessions, mark attendance and share study resources.

**Subject:** Web Application Development (WAD) — Individual Mini Project
**Stack:** React (Vite) + Node.js + Express + MongoDB + JWT

---

## 📖 Table of Contents

1. [About the project](#-about-the-project)
2. [Features](#-features)
3. [Technology stack](#-technology-stack)
4. [Project structure](#-project-structure)
5. [Installation & setup](#-installation--setup)
6. [Environment variables](#-environment-variables)
7. [How to run](#-how-to-run)
8. [Demo credentials](#-demo-credentials)
9. [Database models](#-database-models)
10. [API overview](#-api-overview)
11. [Demonstration flow (viva)](#-demonstration-flow-viva)
12. [Screenshots](#-screenshots)
13. [Testing](#-testing)
14. [Future scope](#-future-scope)

---

## 📌 About the project

Studying alone is hard. Students often do not know who else in their class is
preparing for the same subject at the same pace. **StudyHub** solves this by giving
students one place to:

- discover study groups that match their course, subject, skill level and schedule,
- send a **join request** that the group owner approves or rejects,
- plan **study sessions** with a real agenda, learning objective and expected outcome,
- **mark attendance** after each session and track an attendance percentage,
- **share resources** (notes, PDFs, videos, articles),
- read and post **group announcements**,
- review a complete **session history**.

Every feature is backed by a real REST API, a MongoDB collection and JWT based
authentication — there is no fake data or dummy button in the application.

---

## ✨ Features

### Authentication & security
- Register / Login / Logout with **JWT** (Bearer token in the `Authorization` header)
- Passwords hashed with **bcrypt** (never stored in plain text)
- Protected API routes + protected React routes
- Owner-only actions enforced by backend **authorization middleware**
- Input validation on the frontend **and** the backend
- Friendly error messages (400 / 401 / 403 / 404 / 500) — no raw database errors

### Study groups
- Browse all groups with **search, filters and sorting**
- Filters: course, subject, topic, skill level, day, time, available seats
- Sort by: newest, most members, available seats, name (A–Z)
- Create a group (creator automatically becomes the **Owner** member)
- Edit / delete a group (owner only)
- Capacity tracking with a progress bar and "Group full" state

### Join request workflow
- Student sends a join request with an optional message
- Owner views pending requests and **approves** or **rejects** them
- Approving adds the student to the member list instantly
- Duplicate requests and requests to full groups are blocked by the backend

### Members
- Member table with avatar, name, course, skill level, role and join date
- Owner can **remove a member** (with a confirmation dialog)
- The owner can never be removed and cannot remove themselves

### Sessions & session plan
- Schedule a session: title, date, start time, duration, meeting link
- Full **session plan**: learning objective, agenda (one point per line),
  topics, expected outcome, notes
- Statuses: **Upcoming → In Progress → Completed / Cancelled**
- One-click *Mark complete* / *Cancel* from the group page or the session page

### Attendance
- Owner marks **Present / Absent** for every member of a session
  ("All present" / "All absent" shortcuts, live counter)
- Per-session summary (5/6 attended) and per-member attendance percentage
- Personal attendance page: overall rate, records table, group breakdown
- Dashboard attendance ring and attendance-rate statistic

### Resources
- Share resources of type PDF, Article, Video, Website, Notes, Other
- URL validation, type filter chips, search
- Edit / delete by the person who added it or the group owner

### Announcements
- Owner posts announcements with a title and message
- Consolidated feed across all groups + per-group tab
- Edit / delete by the owner

### User experience
- **Light / Dark mode** with `localStorage` persistence (works on every page)
- Left sidebar layout with active-menu highlighting and a mobile drawer
- Top header with greeting, global search, notification counter, theme toggle,
  user dropdown
- Toast notifications (success / error / warning / info)
- Skeleton loaders, spinners, empty states on every data page
- Responsive from 1440px desktop down to 390px mobile
- Accessible markup (labels, ARIA attributes, keyboard support, skip link)

---

## 🧰 Technology stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | **React 19 + Vite** | Component based UI with a fast dev server |
| Routing | **React Router 7** | Client side routing |
| HTTP | **Fetch API** (small wrapper in `services/api.js`) | No extra dependency, easy to explain |
| Styling | **Hand written CSS** with CSS variables | Full control over the light/dark themes |
| Backend | **Node.js + Express 4** | Simple REST API structure |
| Database | **MongoDB + Mongoose 8** | Document model fits groups/members naturally |
| Auth | **JWT + bcryptjs** | Stateless authentication with hashed passwords |
| Validation | **express-validator** (backend) + custom JS (frontend) | Validate twice, trust nobody |

No GraphQL, no microservices, no Redis, no WebSockets — deliberately kept simple
so that every part can be explained during the viva.

---

## 🗂 Project structure

```
studyhub/
├── backend/                       # Express REST API
│   ├── config/
│   │   └── db.js                  # Mongoose connection
│   ├── controllers/               # Request handlers (business logic)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── groupController.js
│   │   ├── requestController.js
│   │   ├── sessionController.js
│   │   ├── attendanceController.js
│   │   ├── resourceController.js
│   │   ├── announcementController.js
│   │   ├── statsController.js
│   │   └── subjectController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # protect, requireGroupOwner, loadGroupMembership
│   │   ├── errorMiddleware.js     # 404 + central error handler
│   │   └── validators.js          # express-validator rule sets
│   ├── models/                    # Mongoose schemas (database layer)
│   │   ├── User.js  Group.js  JoinRequest.js  Session.js
│   │   └── Attendance.js  Resource.js  Announcement.js  Subject.js
│   ├── routes/                    # Express routers (URL → controller)
│   ├── services/
│   │   └── groupService.js        # group filter / sort / formatting helpers
│   ├── utils/
│   │   ├── ApiError.js  asyncHandler.js  generateToken.js  constants.js
│   │   ├── seed.js                # demo data seeder  (npm run seed)
│   │   └── apiTest.js             # 78 automated API checks (npm run test:api)
│   ├── .env.example
│   └── server.js                  # app entry point
│
├── frontend/                      # React (Vite) single page application
│   ├── src/
│   │   ├── components/            # Reusable UI pieces
│   │   │   ├── ui.jsx             # Modal, ConfirmDialog, Badge, StatCard, Loaders…
│   │   │   ├── Icons.jsx          # Inline SVG icon set
│   │   │   ├── Sidebar.jsx  Header.jsx  Logo.jsx
│   │   │   ├── GroupCard.jsx  SessionCard.jsx  ResourceCard.jsx  AnnouncementCard.jsx
│   │   │   ├── GroupForm.jsx  SessionForm.jsx  ResourceForm.jsx  AnnouncementForm.jsx
│   │   │   ├── AttendanceModal.jsx  FilterBar.jsx  SearchBar.jsx
│   │   ├── context/               # Global state
│   │   │   ├── AuthContext.jsx    # logged in user + JWT
│   │   │   ├── ThemeContext.jsx   # light / dark mode
│   │   │   └── ToastContext.jsx   # notifications
│   │   ├── hooks/
│   │   │   └── useApi.js          # data fetching + debounce + click-outside
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx  # sidebar + header shell
│   │   │   └── PublicLayout.jsx     # landing page shell
│   │   ├── pages/                 # One file per route
│   │   │   ├── Landing.jsx  Login.jsx  Register.jsx
│   │   │   ├── Dashboard.jsx  BrowseGroups.jsx  CreateGroup.jsx
│   │   │   ├── GroupDetails.jsx  MyGroups.jsx
│   │   │   ├── Sessions.jsx  SessionDetails.jsx  History.jsx
│   │   │   ├── Resources.jsx  Announcements.jsx  Attendance.jsx
│   │   │   ├── Profile.jsx  NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js             # fetch wrapper (token, errors)
│   │   │   └── index.js           # one module per API resource
│   │   ├── utils/
│   │   │   ├── constants.js  format.js  validation.js
│   │   ├── App.jsx                # routes + route guards
│   │   ├── main.jsx               # entry point + providers
│   │   └── index.css              # design system (variables, components)
│   ├── scripts/ui-smoke-test.mjs  # optional browser smoke test
│   ├── vite.config.js             # dev server + /api proxy
│   └── .env.example
│
├── docs/
│   ├── API.md                     # complete API reference
│   ├── VIVA.md                    # viva questions & answers
│   └── screenshots/               # generated screenshots
└── README.md
```

---

## ⚙️ Installation & setup

### Prerequisites

| Software | Version | Check with |
|---|---|---|
| Node.js | 18 or newer | `node -v` |
| npm | 9 or newer | `npm -v` |
| MongoDB | 6 or newer (local **or** Atlas) | `mongod --version` |

### 1. Get the code

```bash
git clone <your-repository-url> studyhub
cd studyhub
```

### 2. Backend setup (Express + MongoDB)

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
# open .env and set MONGO_URI + JWT_SECRET
npm run seed              # loads subjects, students, groups, sessions, resources…
npm run dev               # starts the API on http://localhost:5000
```

`npm run dev` uses nodemon for auto-reload. Use `npm start` for a plain start.

### 3. Frontend setup (React + Vite)

Open a **second terminal**:

```bash
cd frontend
npm install
cp .env.example .env      # defaults are fine for local development
npm run dev               # starts the app on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

> The Vite dev server proxies every `/api/...` request to
> `http://127.0.0.1:5000` (see `vite.config.js`), so the frontend never has to
> deal with CORS or hard-coded ports.

### 4. MongoDB setup

**Option A — local MongoDB (used during development)**

```bash
# Linux / macOS
mongod --dbpath /path/to/data
# or as a service
sudo systemctl start mongod
```

Connection string: `mongodb://127.0.0.1:27017/studyhub`

**Option B — MongoDB Atlas (cloud, free tier)**

1. Create a free cluster at <https://cloud.mongodb.com>.
2. Database Access → add a user with a password.
3. Network Access → allow your IP (`0.0.0.0/0` for a demo).
4. Copy the connection string and put it in `backend/.env`:

```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/studyhub
```

Then run `npm run seed` once to create the demo data.

---

## 🔐 Environment variables

**`backend/.env`** (copy from `backend/.env.example`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/studyhub
JWT_SECRET=studyhub_super_secret_change_me_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**`frontend/.env`** (copy from `frontend/.env.example`)

```env
VITE_API_URL=/api
VITE_APP_NAME=StudyHub
```

> ⚠️ Never commit the real `.env` files — they are already listed in `.gitignore`.
> No secret is ever exposed to the frontend: only the short-lived JWT is stored
> in `localStorage`.

---

## ▶️ How to run

| Terminal | Command | URL |
|---|---|---|
| 1 — MongoDB | `mongod --dbpath <data-folder>` | `mongodb://127.0.0.1:27017` |
| 2 — Backend | `cd backend && npm run dev` | <http://localhost:5000> |
| 3 — Frontend | `cd frontend && npm run dev` | <http://localhost:5173> |

Useful backend scripts:

```bash
npm run seed       # wipe demo collections and insert fresh sample data
npm run test:api   # run 78 automated API checks (backend must be running)
npm start          # production-style start (no nodemon)
```

Health check: <http://localhost:5000/api/health>

---

## 👥 Demo credentials

All seeded accounts use the password **`studyhub123`**.

| Email | Name | Role in the demo | What to show |
|---|---|---|---|
| `om@studyhub.com` | Om Bhatt | Owner of *React Study Circle* and *Express & REST API Builders* | Approving requests, sessions, attendance, announcements |
| `rahul@studyhub.com` | Rahul Patel | Owner of *DSA Problem Solvers* | A second owner account |
| `dhruv@studyhub.com` | Dhruv Shah | Owner of *MongoDB Learners*, member of a **full** group | "Group full" state |
| `priya@studyhub.com` | Priya Mehta | Member / has a rejected request | Member view |
| `aarav@studyhub.com` | Aarav Desai | Member | Member view |
| `isha@studyhub.com` | Isha Joshi | Owner of *Computer Networks Squad*, **pending** request in React Study Circle | Join request demo |
| `karan@studyhub.com` | Karan Trivedi | Owner of *OS Concepts Crew* | Normal member |
| `neha@studyhub.com` | Neha Sharma | Owner of *AI & ML Beginners* | Normal member |

**Best demo flow:** login as a new student → send a join request →
login as `om@studyhub.com` → approve it → create a session → mark attendance.

---

## 🗄 Database models

MongoDB database name: **`studyhub`** — 8 collections.

```
users ──┐
        ├─< groups.createdBy        (one owner)
        ├─< groups.members[].user   (many members)
        ├─< joinrequests.user       (many requests)
        ├─< sessions.createdBy
        ├─< attendances.user
        ├─< resources.addedBy
        └─< announcements.postedBy

groups ─┬─< joinrequests.group
        ├─< sessions.group
        ├─< attendances.group
        ├─< resources.group
        └─< announcements.group
```

| Collection | Important fields | Relationships |
|---|---|---|
| `users` | name, email (unique), password (bcrypt hash), course, skillLevel, interests | — |
| `groups` | name, subject, topic, course, skillLevel, maxCapacity, `schedule{day,time}`, status, members[]{user, role, joinedAt} | `createdBy → User`, `members.user → User` |
| `joinrequests` | message, status (Pending/Approved/Rejected), respondedBy, respondedAt | `group → Group`, `user → User` · **unique index on (group, user)** |
| `sessions` | title, learningObjective, agenda[], topics[], expectedOutcome, date, startTime, duration, meetingLink, status, attendanceMarked | `group → Group`, `createdBy → User` |
| `attendances` | status (Present/Absent), markedBy | `session → Session`, `group → Group`, `user → User` · **unique index on (session, user)** |
| `resources` | title, type (PDF/Article/Video/Website/Notes/Other), url, description | `group → Group`, `addedBy → User` |
| `announcements` | title, message | `group → Group`, `postedBy → User` |
| `subjects` | name (unique), course, code, topics[] | reference data for filters |

Schema level rules worth mentioning in the viva:

- `User.password` uses `select: false` — it is never returned by a normal query.
- A `pre('save')` hook hashes the password automatically.
- `matchPassword()` is an instance method that compares plain text with the hash.
- `Group` defines virtuals `memberCount`, `seatsLeft`, `isFull`.
- Unique compound indexes prevent duplicate join requests and duplicate attendance rows.

---

## 🔌 API overview

Base URL: `http://localhost:5000/api` — full reference with request/response
examples in [`docs/API.md`](docs/API.md).

```
AUTH
  POST   /api/auth/register            Register a student
  POST   /api/auth/login               Login → returns JWT
  GET    /api/auth/me                  Current user (session restore)
  POST   /api/auth/logout              Client-side logout

USERS
  GET    /api/users/profile            Profile + learning statistics
  PUT    /api/users/profile            Update profile / password
  GET    /api/users/:id                Another student's public info

GROUPS
  GET    /api/groups                   Browse + q, course, subject, topic, skillLevel,
                                       day, time, available, sort, page, limit
  POST   /api/groups                   Create (creator becomes Owner)
  GET    /api/groups/my                Created / joined / my pending requests
  GET    /api/groups/:id               Group details + viewer permissions
  PUT    /api/groups/:id               Update  (owner)
  DELETE /api/groups/:id               Delete  (owner, cascades)

JOIN REQUESTS
  POST   /api/groups/:id/join          Send a join request
  GET    /api/groups/:id/requests      List requests        (owner)
  PUT    /api/requests/:id/approve     Approve → adds member (owner)
  PUT    /api/requests/:id/reject      Reject                (owner)
  GET    /api/requests/my              Requests I sent
  GET    /api/requests/incoming        Pending requests for my groups (notifications)

MEMBERS
  GET    /api/groups/:id/members       Member list           (member)
  DELETE /api/groups/:id/members/:userId  Remove member      (owner, not self)

SESSIONS
  GET    /api/groups/:id/sessions      Group sessions + stats
  POST   /api/groups/:id/sessions      Create session        (owner)
  GET    /api/sessions/my              My sessions (upcoming / completed / cancelled)
  GET    /api/sessions/:id             Session plan + attendance
  PUT    /api/sessions/:id             Update / change status (owner)
  DELETE /api/sessions/:id             Delete                (owner)

ATTENDANCE
  POST   /api/sessions/:id/attendance  Mark Present/Absent   (owner)
  GET    /api/sessions/:id/attendance  Session attendance rows
  GET    /api/groups/:id/attendance    Group-wise member attendance
  GET    /api/attendance/my            My attendance + completed-session history

RESOURCES
  GET    /api/groups/:id/resources     Group resources (+ ?type= &q=)
  POST   /api/groups/:id/resources     Share a resource      (member)
  PUT    /api/resources/:id            Edit
  DELETE /api/resources/:id            Delete
  GET    /api/resources/my             Resources from all my groups

ANNOUNCEMENTS
  GET    /api/groups/:id/announcements  Group announcements
  POST   /api/groups/:id/announcements  Post                 (owner)
  PUT    /api/announcements/:id         Edit                 (owner)
  DELETE /api/announcements/:id         Delete               (owner)
  GET    /api/announcements/my          Feed from all my groups

STATS
  GET    /api/stats/dashboard          Dashboard cards, upcoming sessions, activity
  GET    /api/stats/history            Completed-session history (from, to, groupId, subject)
  GET    /api/stats/subjects           Subject catalogue + counts
  GET    /api/stats/public             Public landing-page statistics
  GET    /api/health                   Server + database status
```

**Standard response shape**

```json
// success
{ "success": true, "message": "Study group created successfully.", "data": { … } }

// failure
{ "success": false, "message": "Access denied: only the group owner can perform this action" }
```

---

## 🎬 Demonstration flow (viva)

A complete, working 22-step demonstration:

| # | Step | Where |
|---|---|---|
| 1 | Open StudyHub — landing page, features, popular subjects, statistics | `/` |
| 2 | Register a new student (validation + password strength) | `/register` |
| 3 | Login (wrong password first to show the error) | `/login` |
| 4 | Dashboard — stat cards, attendance ring, activity feed | `/dashboard` |
| 5 | Browse study groups | `/groups` |
| 6 | Apply filters: search "react", subject, skill level, schedule, seats | `/groups` |
| 7 | Open group details (Overview / Members / Sessions / tabs) | `/groups/:id` |
| 8 | Send a join request with a message | `/groups/:id` |
| 9 | Login as the owner (`om@studyhub.com`) | `/login` |
| 10 | Approve the request (notification bell shows the counter) | `/groups/:id?tab=members` |
| 11 | Member list now shows the new student | Members tab |
| 12 | Create a study session with agenda + objective + outcome | Sessions tab → *Schedule session* |
| 13 | Session plan visible on the session page | `/sessions/:id` |
| 14 | Mark attendance — Present / Absent per member | Sessions tab → *Attendance* |
| 15 | Mark the session complete | *Mark complete* |
| 16 | Session history with "5/6 attended" | History tab / `/history` |
| 17 | Add a resource (URL validation demo) | Resources tab |
| 18 | Post an announcement | Announcements tab |
| 19 | Dashboard statistics update after the actions | `/dashboard` |
| 20 | Toggle dark mode (sidebar or header) — then refresh the page | Any page |
| 21 | Show attendance page and profile statistics | `/attendance`, `/profile` |
| 22 | Resize to mobile / open DevTools device toolbar — sidebar becomes a drawer | Any page |

Extra things to show if the examiner asks:
- Wrong/duplicate email on register, weak password, mismatched confirmation
- Attempting to edit a group while logged in as a member → **403 Access denied**
- Deleting a resource that does not exist → **404 Resource not found**
- `GET /api/groups/12345` → **400 Invalid id format**
- A full group's card shows the disabled **Group full** button

---

## 📸 Screenshots

Screenshots of every page (light mode, dark mode, mobile and tablet) are in
[`docs/screenshots/`](docs/screenshots):

| File | Page |
|---|---|
| `01-landing-light.png`, `01b-landing-dark.png` | Landing page (both themes) |
| `02-register.png`, `04-login.png` | Authentication pages |
| `03-dashboard-new-user.png`, `05-dashboard-owner.png` | Dashboard |
| `06-browse-groups.png`, `06b-browse-search.png`, `06c-browse-filter-subject.png` | Browse + search + filters |
| `07-group-overview.png` … `14-group-history.png` | Group details tabs |
| `08-group-members-requests.png`, `08b-member-approved.png` | Join request → approval |
| `10-attendance-modal.png` | Marking attendance |
| `15-my-groups.png` … `22-create-group.png` | My groups, sessions, resources, announcements, attendance, history, profile, create group |
| `23-session-details.png` | Session plan page |
| `24-dashboard-dark.png`, `25-browse-groups-dark.png`, `26-my-groups-dark.png`, `26b-dark-after-reload.png` | Dark mode on multiple pages + persistence after refresh |
| `27-mobile-dashboard.png`, `28-mobile-drawer.png`, `29-mobile-browse.png`, `30-tablet-browse.png` | Mobile drawer + responsive layouts (390px and 820px) |
| `31-not-found.png` | 404 page |

---

## 🧪 Testing

### Automated API tests (78 checks)

```bash
cd backend
npm run dev        # in one terminal
npm run test:api   # in another terminal
```

The script follows the exact demonstration flow: registration, login, validation
errors, group CRUD, the whole join-request workflow, sessions, attendance,
resources, announcements, statistics and error handling.

```
──────────────────────────────────────────────
  RESULT:  78 passed, 0 failed  (78 checks)
──────────────────────────────────────────────
```

### Optional browser smoke test

```bash
cd frontend
npm install --save-dev puppeteer
node scripts/ui-smoke-test.mjs
```

It drives a real headless Chrome through the app, reports console errors and
saves screenshots into `docs/screenshots/`.

### Manual checks worth doing before the viva

- Both themes on every page
- Mobile drawer (390px), tablet (820px), desktop (1440px)
- Wrong password, duplicate email, weak password, mismatched confirmation
- Member trying to perform an owner-only action → 403 toast
- Refresh after login (session persists) and after logout (redirect to login)

---

## 🚀 Future scope

- Email / in-app reminders before a session starts
- Calendar export (`.ics`) and Google Calendar integration
- File upload for resources (currently links only) using Multer / GridFS
- Direct messages between group members
- Group chat / discussion thread (would need WebSockets)
- AI based group recommendation using the interests field
- Certificate or badge for members with a high attendance rate
- Admin dashboard for the college to monitor all groups
- Progressive Web App (offline access to session notes)

---

## 📄 License

Created for academic purposes as a Web Application Development mini project.
Free to use, modify and learn from.

---

## 🙏 Acknowledgements

Built with [React](https://react.dev), [Vite](https://vitejs.dev),
[Express](https://expressjs.com), [MongoDB](https://www.mongodb.com) and
[Mongoose](https://mongoosejs.com). Icons are hand-drawn inline SVGs, so the
project has no external icon dependency.
