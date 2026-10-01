# StudyHub — Viva Preparation Guide

Everything an examiner is likely to ask, answered from **this** project's code.
Open the mentioned file while answering — pointing at real code always scores better.

---

## 1. Project basics

**Q. What is StudyHub?**
A full-stack web application for college students to form and manage study groups.
Students register, discover groups that match their subject/skill/schedule, send
join requests, and once approved they can attend scheduled sessions, get their
attendance marked and share resources.

**Q. Why did you choose this problem?**
Group study is more effective than studying alone but organising it happens in
WhatsApp groups that lose messages. StudyHub keeps group discovery, scheduling,
attendance and study material in one place with a proper database.

**Q. What is the architecture?**
Three-tier: **React SPA (presentation)** → **Express REST API (logic)** →
**MongoDB (data)**. The browser only talks to the API with JSON over HTTP; the
API talks to MongoDB with Mongoose.

**Q. How is the frontend connected to the backend?**
Through the Fetch API. `frontend/src/services/api.js` wraps `fetch`, adds the JWT
header and converts errors. The Vite dev server proxies `/api/*` to
`http://127.0.0.1:5000` (`frontend/vite.config.js`), so there is no CORS problem
in development.

---

## 2. HTML & CSS

**Q. Where is semantic HTML used?**
`<nav>`, `<header>`, `<main>`, `<section>`, `<article>`, `<table>`, `<form>`,
`<label>`, `<button>`, `<ol>`/`<ul>`. Example: `GroupDetails.jsx` renders member
data in a real `<table>` with `<thead>` and `<tbody>`.

**Q. How did you make the layout responsive?**
CSS Grid and Flexbox plus media queries at 1200 / 1024 / 860 / 560 px in
`frontend/src/index.css`. Card grids use
`grid-template-columns: repeat(auto-fill, minmax(310px, 1fr))`, tables get a
horizontal scroll container (`.table-wrap`), and below 860px the sidebar is
translated off-screen and becomes a drawer with a backdrop.

**Q. How does dark mode work without duplicating any CSS?**
Every colour is a CSS variable defined in `:root`. The dark theme redefines the
same variables under `[data-theme='dark']`. So `#4f46e5 → var(--brand-600)`
switches automatically for the whole app. `ThemeContext` sets
`document.documentElement.dataset.theme` and stores the choice in
`localStorage`, so the theme survives navigation and refresh.

**Q. What CSS techniques are visible in the UI?**
Soft shadows, border radii, `backdrop-filter: blur()` on the sticky header,
gradient only on hero/stat highlights, CSS transitions (150–300 ms),
`@keyframes` for toasts/modals/skeletons, `prefers-reduced-motion` support, and
a conic/`stroke-dasharray` progress ring on the dashboard.

---

## 3. JavaScript

**Q. Which modern JavaScript features did you use?**
`const`/`let`, arrow functions, template literals, destructuring, spread/rest,
optional chaining `data?.stats`, nullish coalescing `?? 0`, modules
(`import`/`export`), array methods (`map`, `filter`, `reduce`, `some`, `find`,
`Set`, `Promise.all`), async/await and `try/catch/finally`.

**Q. Where do you use `map` and `filter`?**
`groupService.js` (backend) maps documents into the shape the UI needs;
`BrowseGroups.jsx` and `Resources.jsx` filter results; `attendanceController.js`
uses `reduce` to build a `userId → attendance` map.

**Q. Where is the DOM manipulated directly?**
Only where React cannot: `ThemeContext` sets the `data-theme` attribute on
`<html>`, and `Modal` locks `document.body.style.overflow` and listens for the
Escape key. Everything else is declarative React rendering.

---

## 4. React

**Q. Difference between props and state in your project?**
`GroupCard` receives `group` and `onJoin` as **props** (read-only, owned by the
parent). `BrowseGroups` owns the **state** (`filters`, `joinTarget`) because it
decides what to fetch and which modal is open.

**Q. Which built-in hooks did you use and why?**

| Hook | Example in the project |
|---|---|
| `useState` | form values, loading flags, modal visibility |
| `useEffect` | load tab data, poll notifications, close the mobile drawer on route change, Escape key listener |
| `useContext` | `useAuth()`, `useTheme()`, `useToast()` |
| `useMemo` | derive `activeSessions`, `ownedGroupIds`, `pendingRequests` without recomputing every render |
| `useCallback` | memoise `loadGroup`, `persistUser` so effects do not loop |
| `useRef` | keep the latest async function, track mount status, click-outside detection |
| `useParams` | read `/groups/:id` |
| `useNavigate`, `useLocation` | redirect after login/creation, remember the page the user came from |
| `useSearchParams` | keep filters and the group tab in the URL (shareable links) |

**Q. How do you share state between distant components?**
Context API. `AuthContext` (user + token), `ThemeContext` (light/dark),
`ToastContext` (notifications). They are provided once in `main.jsx`, so the
sidebar, header and every page read the same values without prop drilling.

**Q. Why a custom `useApi` hook?**
To avoid repeating try/catch/loading/error logic in ~12 pages. It returns
`{ data, loading, error, reload }`, and `reload()` is how the UI refreshes after
a create/approve/delete.

**Q. How are forms handled?**
Controlled components: each input's `value` comes from state and `onChange`
updates it, so validation can run live. `GroupForm`, `SessionForm`,
`ResourceForm`, `AnnouncementForm` are reusable — the create page and the edit
modal use the same component with different `initialValues`.

**Q. How do you prevent a request on every keystroke?**
`useDebounce` (350 ms) inside `hooks/useApi.js` — the search text is only sent
after the user pauses typing.

**Q. How are routes protected?**
`App.jsx` wraps the dashboard routes in `<RequireAuth>` which reads
`AuthContext`. No user → `<Navigate to="/login" replace />`.
`<RedirectIfAuth>` keeps logged-in users away from `/login` and `/register`.

**Q. Why is `key` important in lists?**
React uses it to identify which item changed. Group/session lists use the MongoDB
`_id` as key so React updates the DOM correctly instead of re-rendering everything.

---

## 5. Node.js & Express

**Q. Explain the request flow in your backend.**
`Route → middleware (protect, validators) → controller → model → MongoDB`.
Example: `PUT /api/groups/:id` runs `protect` (verify JWT) →
`requireGroupOwner` (load group, check ownership) → `updateGroup` (validate
capacity, save) → returns JSON.

**Q. What middleware did you write?**

| Middleware | Job |
|---|---|
| `protect` | Read `Authorization: Bearer <token>`, verify with JWT, attach `req.user` |
| `requireGroupOwner` | Load the group and allow only `group.createdBy` → makes owner-only features safe |
| `loadGroupMembership` | Allow owner or member (read operations) |
| `errorHandler` | Convert any thrown error into `{ success:false, message }`, map Mongoose errors to friendly codes |
| `notFound` | 404 for unknown routes |
| validator rule sets | `express-validator` rules that return field-level messages |

**Q. Why `asyncHandler`?**
So controllers can be plain `async` functions and any rejected promise is
forwarded to the error middleware — no `try/catch` in all 40 handlers.

**Q. What is `express.json()` for?**
It parses the JSON request body into `req.body`. Without it `req.body` is undefined.

---

## 6. MongoDB & Mongoose

**Q. Why MongoDB instead of SQL?**
The data is naturally document shaped: a group document contains its member list,
which is always read together. Schemas can also evolve easily during a project.
Relationships still exist and are stored with `ObjectId` references
(`Group.createdBy → User`, `Session.group → Group`).

**Q. Which collections (models) exist?**
`users`, `groups`, `joinrequests`, `sessions`, `attendances`, `resources`,
`announcements`, `subjects` — 8 in total, all in `backend/models/`.

**Q. How are the relationships implemented?**

```js
groupSchema = {
  createdBy: { type: ObjectId, ref: 'User' },        // one owner
  members: [{ user: { type: ObjectId, ref: 'User' }, role: String, joinedAt: Date }]
}
sessionSchema = { group: { type: ObjectId, ref: 'Group' }, createdBy: { ref: 'User' } }
attendanceSchema = { session: { ref: 'Session' }, group: { ref: 'Group' }, user: { ref: 'User' } }
```

`.populate('createdBy', 'name course')` replaces the ids with real user documents
when the API answers.

**Q. Which indexes did you define?**

- `users.email` → `unique: true`
- `joinrequests (group, user)` → compound **unique** index (blocks duplicate requests)
- `attendances (session, user)` → compound **unique** index (one row per member per session)
- `groups.name/subject/topic/description` → text index for search

**Q. Show a Mongoose-specific feature from your code.**

```js
// models/User.js
userSchema.pre('save', async function () {           // hashing hook
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.matchPassword = function (plain) {  // instance method
  return bcrypt.compare(plain, this.password);
};
userSchema.virtual('memberCount').get(...);           // virtual in Group
```

---

## 7. REST API design

**Q. What makes your API RESTful?**
Resources are nouns in the URL (`/api/groups/:id/sessions`), the HTTP verb
expresses the action (`GET` read, `POST` create, `PUT` update, `DELETE`
delete), and status codes carry the result (200/201/400/401/403/404/500).
Nested resources show the relationship: sessions belong to a group.

**Q. Why is `/api/groups/my` declared before `/api/groups/:id`?**
Express matches routes in order. If `/:id` came first, the literal `my` would be
treated as an id and fail the `isMongoId()` validation.

**Q. How do you test the API without the frontend?**
`cd backend && npm run test:api` — 78 checks using `fetch`, covering the entire
demonstration flow, plus Postman or curl:

```bash
curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"om@studyhub.com","password":"studyhub123"}'
```

---

## 8. Authentication & authorization

**Q. Explain your JWT flow.**

1. `POST /api/auth/register|login` → backend compares the bcrypt hash, then
   `jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })`.
2. The frontend stores the token in `localStorage` (`AuthContext`).
3. Every request sends `Authorization: Bearer <token>` (`services/api.js`).
4. `protect` verifies the signature, loads the user and attaches `req.user`.
5. On page refresh `GET /api/auth/me` restores the session; an expired token is
   removed and the user is redirected to `/login`.

**Q. Why JWT and not sessions?**
It is stateless — the server keeps no session store, which suits a REST API and
a React SPA, and it is easy to demonstrate.

**Q. How do you know a user is the group owner (authorization)?**
`requireGroupOwner` compares `group.createdBy.toString() === req.user._id.toString()`
and otherwise throws **403 Access denied: only the group owner can perform this action**.
It is applied to update/delete group, view+approve/reject requests, remove
member, create session, mark attendance and post announcements.

**Q. Is the password ever sent to the frontend?**
No. `password: { select: false }` in the schema means normal queries exclude it,
and controllers return only safe fields.

**Q. What stops a member from calling an owner API directly?**
The middleware. Even if someone crafts a request with Postman, the server checks
the ownership on the database document before doing anything. Frontend hiding is
only a UX convenience, never a security control.

---

## 9. Validation & error handling

**Q. How do you validate twice?**
Frontend: `utils/validation.js` (`validateGroup`, `validateSession`,
`validateResource`, `validateRegister`, …) gives instant field errors.
Backend: `middleware/validators.js` uses `express-validator` rule sets, so a
direct API call is validated too. Mongoose adds schema-level validation
(required, min/max, enum, regex, maxlength) as the last line of defence.

**Q. Give three concrete validation rules.**
1. Password ≥ 6 characters and `confirmPassword` must match.
2. Group capacity must be an integer between 2 and 50 — and it cannot be lowered
   below the current member count.
3. Meeting link / resource URL must match `^https?://` (`isURL({ require_protocol: true })`).

**Q. How are errors reported to the user?**
The API always answers `{ success: false, message }`. `services/api.js` turns a
non-2xx response into an `ApiError`, and the page shows `error.message` in a
**toast**. Examples: *"Invalid email or password."*, *"Your join request is
already pending approval"*, *"Access denied: only the group owner can perform
this action"*.

**Q. Why do 500 errors show a generic message?**
`errorHandler` logs the real stack on the server but returns
"Something went wrong on the server." — stack traces and database messages must
not leak to users.

---

## 10. Feature-specific questions

**Q. How does the join-request workflow work?**
`JoinRequest` documents with `status: Pending → Approved | Rejected`. The unique
index on `(group, user)` prevents duplicates; the controller also checks if the
user is already a member or if the group is full. On approve, the user is pushed
into `group.members` — that single array is the source of truth for "is a member".
`viewer.requestStatus` tells the UI which button to show.

**Q. Do you use database transactions?**
No. The project is a mini project and the operations are simple. Cascading
deletes are done with `Promise.all([...deleteMany])` in `deleteGroup`, and
attendance is an idempotent upsert, so re-running is safe.

**Q. How does attendance produce a percentage?**
`attendanceController.getGroupAttendance` runs a MongoDB **aggregation** —
`$match` the group, `$group` by user with `$sum: { $cond: [{ $eq: ['$status','Present'] }, 1, 0] }`.
The controller turns those counts into `attendanceRate` per member and an overall rate.

**Q. How do "Upcoming" and "Completed" sessions differ?**
The `status` field is changed by the owner (Mark complete / Cancel).
`GET /api/stats/history` returns Completed + Cancelled sessions with a
per-session present count, which is the "5/6 attended" column in the history page.

**Q. How is search implemented?**
`groupService.buildGroupFilter` builds a MongoDB query: the `q` search box
creates a case-insensitive `$or` over name/subject/topic/description/course using
a `RegExp`, with special characters escaped so user input cannot break the query.
Other filters map to exact fields, and `available=true` uses
`$expr: { $lt: [{ $size: '$members' }, '$maxCapacity'] }`.

---

## 11. Security

| Practice | Where |
|---|---|
| Password hashing (bcrypt, 10 salt rounds) | `models/User.js` pre-save hook |
| No plain-text passwords, never selected by default | `select: false` |
| JWT with expiry (7 days) | `utils/generateToken.js`, `JWT_SECRET` in `.env` |
| Protected routes | `protect` middleware + `RequireAuth` in the SPA |
| Role based authorization | `requireGroupOwner`, ownership checks in controllers |
| Input validation on both sides | `middleware/validators.js`, `utils/validation.js` |
| Secrets outside the code | `.env` + `.env.example`, `.gitignore` |
| Regex escaping | `escapeRegex()` in `groupService.js` |
| Generic 500 messages | `middleware/errorMiddleware.js` |

**Q. Is `localStorage` for the token safe?**
It is simple and appropriate for a mini project. For production the recommended
approach is an httpOnly, secure cookie so JavaScript cannot read the token.
This trade-off is documented in the README's future scope.

---

## 12. Common follow-up questions

**Q. Why did you not use Redux?**
Context + hooks are enough for this scale. Redux adds ceremony without benefit here.

**Q. What was the hardest part?**
Keeping authorization correct: students must see a group's *overview* but not its
members, sessions or resources unless they are a member. This is solved with
`viewer` flags computed in `groupService.formatGroup` on the backend, and by
verifying membership again in each read controller.

**Q. How would you scale this?**
Add pagination limits (already supported), text/compound indexes, Redis caching
for the dashboard counters, and split heavy analytics into a scheduled job.

**Q. What would you do differently?**
Add automated integration tests from day one, use httpOnly cookies for the token,
and split `GroupDetails.jsx` (which has 7 tabs) into smaller tab components.

**Q. Show me a bug you fixed.**
The session edit endpoint reused the create validator, so sending only
`{ status: 'Completed' }` failed with "Session title is required". I created a
separate `sessionUpdateRules` where every field is optional — which is exactly
what the API test suite caught.

---

## 13. 60-second summary (memorise this)

> StudyHub is a MERN-stack study group platform. The frontend is React with Vite,
> React Router and Context for state; the backend is Express with eight Mongoose
> models and JWT authentication; data lives in MongoDB. Students browse groups with
> real search and filters, send join requests that owners approve, schedule
> sessions with agendas, mark attendance, share resources and post announcements.
> The API is RESTful with validation, authorization middleware and consistent error
> responses, and the UI is a responsive dashboard with light and dark themes.
> Everything I will show you is backed by the database — nothing is mocked.
