# VoxCampus

Anonymous campus communication platform — Chitkara University.

## Project Structure

```
voxcampus/
├── server/                  ← Node.js + Express + Socket.IO + MongoDB
│   ├── config/
│   │   ├── db.js            ← MongoDB connection
│   │   └── seed.js          ← Demo data seeder
│   ├── models/
│   │   ├── User.js
│   │   ├── Class.js
│   │   ├── Subject.js
│   │   ├── Channel.js
│   │   ├── Message.js
│   │   ├── Post.js
│   │   └── Poll.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── messages.js
│   │   ├── posts.js
│   │   ├── polls.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── socket/
│   │   └── index.js         ← Socket.IO event handlers
│   ├── .env                 ← Environment variables
│   └── index.js             ← Entry point
│
└── client/                  ← React + Vite
    ├── src/
    │   ├── components/
    │   │   ├── chat/ChatView.jsx
    │   │   ├── feed/FeedView.jsx
    │   │   ├── polls/PollsPanel.jsx
    │   │   ├── admin/AdminPanel.jsx
    │   │   └── shared/Sidebar.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── SocketContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   └── Dashboard.jsx
    │   ├── utils/api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongod`) **or** a MongoDB Atlas URI

---

## Setup

### 1. Clone & install

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure environment

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voxcampus
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://localhost:5173
ADMIN_ROLL=ADMIN001
ADMIN_PASSWORD=admin@voxcampus
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string.

### 3. Seed the database

```bash
cd server
npm run seed
```

Output:
```
MongoDB connected: localhost
Cleared existing data...
Subjects created...
Channels created...
Teachers created...
Students created...

✅ Seed complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Login credentials:
  Student  → rollNo: 2410991517  password: 2410991517
  Teacher  → rollNo: TCH001       password: teacher@123
  Admin    → rollNo: ADMIN001     password: admin@voxcampus
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Run development servers

Terminal 1 — Server:
```bash
cd server
npm run dev
# → http://localhost:5000
```

Terminal 2 — Client:
```bash
cd client
npm run dev
# → http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Demo Accounts

| Role    | Roll No      | Password       | Description                      |
|---------|-------------|----------------|----------------------------------|
| Student | 2410991517  | 2410991517     | Satyam Godara · G-19 · CSE Sem 4 |
| Student | 2410992001  | 2410992001     | Ananya Joshi · G-20              |
| Teacher | TCH001      | teacher@123    | Dr. Rajesh Kumar · Linux + DSA   |
| Admin   | ADMIN001    | admin@voxcampus | Full visibility + management     |

---

## Student: Satyam Godara

```
Roll No  : 2410991517
Email    : satyam1517.becse24@chitkara.edu.in
Class    : G-19  (CSE-24 Sem-4)
Subjects :
  CSE2301 · Linux Administration
  CSE0203 · Data Structures & Algorithms
  CSE2303 · Discrete Structures
  CSE2304 · Backend Engineering-I
```

On login, the sidebar loads:
- General, Feedback, Complaints (global)
- Subject rooms for all 4 subjects above

---

## Anonymity model

- Every user has an `anonAlias` stored in the database (e.g. `Student#1517`)
- API never exposes `authorRef` to non-admin clients
- Admin can see real names via `/api/admin/students` — not surfaced in the chat UI
- Aliases are stable (same across sessions) for conversation continuity

---

## API Endpoints

### Auth
```
POST /api/auth/login    { rollNo, password }
GET  /api/auth/me
```

### Messages (Chat)
```
GET    /api/messages/:channelId?page=1&limit=50
POST   /api/messages/:channelId    { content, type?, announcementMeta? }
DELETE /api/messages/:messageId
```

### Posts (Feed)
```
GET  /api/posts/:channelId?sort=votes|recent
POST /api/posts/:channelId          { content }
POST /api/posts/:postId/vote        { vote: 'up'|'down'|null }
POST /api/posts/:postId/comment     { content }
DELETE /api/posts/:postId
```

### Polls
```
GET  /api/polls/:channelId
POST /api/polls/:channelId          { question, options[], closesAt? }  [teacher/admin]
POST /api/polls/:pollId/vote        { optionIndex }
```

### Admin
```
GET /api/admin/stats
GET /api/admin/students
GET /api/admin/teachers
GET /api/admin/classes
PUT /api/admin/students/:id         { classId?, realName?, email? }
DELETE /api/admin/students/:id
PUT /api/admin/teachers/:id/assign  { classIds[] }
```

---

## Adding your real student data

When you have the full CSV/Excel of students, create a script like:

```js
// scripts/import-students.js
const students = require('./students.json'); // your real data

for (const s of students) {
  await User.create({
    rollNo: s.rollNo,
    realName: s.name,
    email: s.email,
    password: await bcrypt.hash(s.rollNo, 10),
    role: 'student',
    classRef: classMap[s.classId],
    subjectRefs: subjectsByClass[s.classId],
    anonAlias: `Student#${parseInt(s.rollNo.slice(-4)) % 9000 + 1000}`,
  });
}
```

---

## Next features to build

- [ ] Attendance system (geo-fenced OTP)
- [ ] Anonymous elections (blind token voting)
- [ ] Private student ↔ teacher DMs
- [ ] Teacher analytics dashboard (participation graphs)
- [ ] Push notifications (FCM)
- [ ] File uploads for posts and announcements