/**
 * StudyHub - database seeding script
 * Run with:  npm run seed      (inside the backend folder)
 *
 * It clears the demo collections and inserts realistic sample data so the
 * project looks populated during the college demonstration.
 */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Group = require('../models/Group');
const JoinRequest = require('../models/JoinRequest');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Resource = require('../models/Resource');
const Announcement = require('../models/Announcement');
const Subject = require('../models/Subject');

/** Helper: a date n days from today (negative = in the past). */
const daysFromNow = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};

const SUBJECTS = [
  {
    name: 'Web Application Development',
    course: 'Computer Engineering',
    code: 'CE-501',
    topics: ['React', 'Node.js', 'Express', 'MongoDB', 'REST API', 'HTML/CSS', 'JavaScript'],
  },
  { name: 'Data Structures', course: 'Computer Engineering', code: 'CE-301', topics: ['Arrays', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming'] },
  { name: 'Database Management System', course: 'Computer Engineering', code: 'CE-303', topics: ['SQL', 'Normalization', 'MongoDB', 'Transactions', 'Indexing'] },
  { name: 'Object Oriented Programming', course: 'Computer Engineering', code: 'CE-302', topics: ['Java', 'Inheritance', 'Polymorphism', 'Design Patterns'] },
  { name: 'Computer Organization', course: 'Computer Engineering', code: 'CE-304', topics: ['Pipelining', 'Cache Memory', 'Assembly', 'Instruction Set'] },
  { name: 'Computer Networks', course: 'Information Technology', code: 'IT-401', topics: ['TCP/IP', 'Routing', 'Subnetting', 'Network Security'] },
  { name: 'Operating Systems', course: 'Computer Engineering', code: 'CE-305', topics: ['Process Scheduling', 'Deadlock', 'Memory Management', 'Threads'] },
  { name: 'Artificial Intelligence', course: 'Information Technology', code: 'IT-501', topics: ['Search Algorithms', 'Neural Networks', 'Machine Learning Basics'] },
];

const USERS = [
  { name: 'Om Bhatt', email: 'om@studyhub.com', password: 'studyhub123', course: 'Computer Engineering', skillLevel: 'Advanced', interests: ['Web Application Development', 'Artificial Intelligence'], avatarColor: '#4f46e5' },
  { name: 'Rahul Patel', email: 'rahul@studyhub.com', password: 'studyhub123', course: 'Computer Engineering', skillLevel: 'Intermediate', interests: ['Data Structures', 'Web Application Development'], avatarColor: '#7c3aed' },
  { name: 'Dhruv Shah', email: 'dhruv@studyhub.com', password: 'studyhub123', course: 'Information Technology', skillLevel: 'Beginner', interests: ['Computer Networks', 'Database Management System'], avatarColor: '#0ea5e9' },
  { name: 'Priya Mehta', email: 'priya@studyhub.com', password: 'studyhub123', course: 'Computer Engineering', skillLevel: 'Advanced', interests: ['Artificial Intelligence', 'Data Structures'], avatarColor: '#db2777' },
  { name: 'Aarav Desai', email: 'aarav@studyhub.com', password: 'studyhub123', course: 'Computer Engineering', skillLevel: 'Intermediate', interests: ['Object Oriented Programming', 'Web Application Development'], avatarColor: '#059669' },
  { name: 'Isha Joshi', email: 'isha@studyhub.com', password: 'studyhub123', course: 'Information Technology', skillLevel: 'Intermediate', interests: ['Database Management System', 'Computer Networks'], avatarColor: '#d97706' },
  { name: 'Karan Trivedi', email: 'karan@studyhub.com', password: 'studyhub123', course: 'Computer Engineering', skillLevel: 'Beginner', interests: ['Operating Systems', 'Computer Organization'], avatarColor: '#0891b2' },
  { name: 'Neha Sharma', email: 'neha@studyhub.com', password: 'studyhub123', course: 'Information Technology', skillLevel: 'Advanced', interests: ['Artificial Intelligence', 'Operating Systems'], avatarColor: '#dc2626' },
];

const run = async () => {
  await connectDB();
  console.log('\n🌱 Seeding StudyHub database...\n');

  // ---- clear old data ----
  await Promise.all([
    User.deleteMany({}),
    Group.deleteMany({}),
    JoinRequest.deleteMany({}),
    Session.deleteMany({}),
    Attendance.deleteMany({}),
    Resource.deleteMany({}),
    Announcement.deleteMany({}),
    Subject.deleteMany({}),
  ]);
  console.log('   ✓ Cleared existing collections');

  // ---- subjects ----
  await Subject.insertMany(SUBJECTS);
  console.log(`   ✓ Inserted ${SUBJECTS.length} subjects`);

  // ---- users (password hashed automatically by the model hook) ----
  const users = [];
  for (const u of USERS) {
    const created = await User.create(u);
    users.push(created);
  }
  const [om, rahul, dhruv, priya, aarav, isha, karan, neha] = users;
  console.log(`   ✓ Created ${users.length} students (password for all: studyhub123)`);

  // ---- groups ----
  const groupSeeds = [
    {
      name: 'React Study Circle',
      subject: 'Web Application Development',
      topic: 'React Hooks & State Management',
      course: 'Computer Engineering',
      skillLevel: 'Intermediate',
      maxCapacity: 8,
      schedule: { day: 'Monday', time: 'Evening' },
      description:
        'A weekly hands-on circle for students learning React. We rebuild small UI components together, discuss hooks, component design and how state flows through an application.',
      createdBy: om._id,
      members: [om, rahul, aarav],
    },
    {
      name: 'DSA Problem Solvers',
      subject: 'Data Structures',
      topic: 'Trees, Graphs & Dynamic Programming',
      course: 'Computer Engineering',
      skillLevel: 'Advanced',
      maxCapacity: 6,
      schedule: { day: 'Wednesday', time: 'Morning' },
      description:
        'We solve two algorithm problems every week on the whiteboard first and then code them. Focus areas: trees, graph traversals and dynamic programming patterns.',
      createdBy: rahul._id,
      members: [rahul, priya, om],
    },
    {
      name: 'MongoDB Learners',
      subject: 'Database Management System',
      topic: 'MongoDB, Aggregation & Indexing',
      course: 'Computer Engineering',
      skillLevel: 'Beginner',
      maxCapacity: 10,
      schedule: { day: 'Tuesday', time: 'Afternoon' },
      description:
        'A friendly group for DBMS students. We practise schema design, write aggregation pipelines and compare MongoDB queries with SQL from our syllabus.',
      createdBy: dhruv._id,
      members: [dhruv, isha],
    },
    {
      name: 'Java OOP Group',
      subject: 'Object Oriented Programming',
      topic: 'Inheritance, Interfaces & Design Patterns',
      course: 'Computer Engineering',
      skillLevel: 'Intermediate',
      maxCapacity: 7,
      schedule: { day: 'Thursday', time: 'Evening' },
      description:
        'For students who want to understand object oriented concepts with real Java programs. Each session covers one concept plus a small coding exercise.',
      createdBy: aarav._id,
      members: [aarav, karan, rahul],
    },
    {
      name: 'Computer Networks Squad',
      subject: 'Computer Networks',
      topic: 'Subnetting, Routing & TCP/IP',
      course: 'Information Technology',
      skillLevel: 'Beginner',
      maxCapacity: 8,
      schedule: { day: 'Saturday', time: 'Morning' },
      description:
        'Network fundamentals made simple. We do subnetting drills, trace packets with Wireshark, and discuss routing protocols before the university exam.',
      createdBy: isha._id,
      members: [isha, dhruv, karan],
    },
    {
      name: 'AI & ML Beginners',
      subject: 'Artificial Intelligence',
      topic: 'Machine Learning Basics & Neural Networks',
      course: 'Information Technology',
      skillLevel: 'Beginner',
      maxCapacity: 12,
      schedule: { day: 'Sunday', time: 'Afternoon' },
      description:
        'An entry level group for AI curious students. We start from search algorithms, move to basic machine learning and finish with a small neural network demo.',
      createdBy: neha._id,
      members: [neha, priya],
    },
    {
      name: 'OS Concepts Crew',
      subject: 'Operating Systems',
      topic: 'Process Scheduling & Deadlocks',
      course: 'Computer Engineering',
      skillLevel: 'Intermediate',
      maxCapacity: 6,
      schedule: { day: 'Friday', time: 'Evening' },
      description:
        'We take one OS topic every week, draw the diagrams on the board and solve previous year university questions together.',
      createdBy: karan._id,
      members: [karan, neha, om],
    },
    {
      name: 'Express & REST API Builders',
      subject: 'Web Application Development',
      topic: 'Node.js, Express & REST APIs',
      course: 'Computer Engineering',
      skillLevel: 'Advanced',
      maxCapacity: 5,
      schedule: { day: 'Tuesday', time: 'Evening' },
      description:
        'For students who already know JavaScript. We build small REST APIs with Express, learn routing, middleware, JWT authentication and error handling.',
      createdBy: om._id,
      members: [om, priya],
    },
    {
      name: 'Computer Organization Clinic',
      subject: 'Computer Organization',
      topic: 'Pipelining & Cache Memory',
      course: 'Computer Engineering',
      skillLevel: 'Beginner',
      maxCapacity: 4,
      schedule: { day: 'Wednesday', time: 'Afternoon' },
      description:
        'A small group that meets to revise pipelining, cache mapping and instruction cycle using diagrams and numercial practice problems.',
      createdBy: dhruv._id,
      // full on purpose -> demonstrates the "Group Full" state
      members: [dhruv, aarav, isha, karan],
    },
  ];

  const groups = [];
  for (const seed of groupSeeds) {
    const group = await Group.create({
      ...seed,
      members: seed.members.map((member, index) => ({
        user: member._id,
        role: index === 0 ? 'Owner' : 'Member',
        joinedAt: daysFromNow(-20 + index),
      })),
    });
    groups.push(group);
  }
  console.log(`   ✓ Created ${groups.length} study groups`);

  const [reactGroup, dsaGroup, mongoGroup, javaGroup, cnGroup, aiGroup, osGroup, expressGroup, coGroup] = groups;

  // ---- join requests (pending, approved, rejected) ----
  await JoinRequest.insertMany([
    { group: reactGroup._id, user: isha._id, message: 'I want to learn React for my mini project.', status: 'Pending' },
    { group: reactGroup._id, user: karan._id, message: 'Please add me, I know basic JavaScript.', status: 'Pending' },
    { group: dsaGroup._id, user: dhruv._id, message: 'I need help with graphs.', status: 'Pending' },
    { group: aiGroup._id, user: om._id, message: 'Interested in the neural network session.', status: 'Pending' },
    { group: osGroup._id, user: isha._id, message: 'We are in the same division.', status: 'Pending' },
    { group: javaGroup._id, user: neha._id, message: 'I want to revise design patterns.', status: 'Approved', respondedBy: aarav._id, respondedAt: daysFromNow(-6) },
    { group: cnGroup._id, user: priya._id, message: 'Subnetting practice please!', status: 'Rejected', respondedBy: isha._id, respondedAt: daysFromNow(-4) },
  ]);
  console.log('   ✓ Created 7 join requests (5 pending, 1 approved, 1 rejected)');

  // ---- sessions ----
  const sessionSeeds = [
    // React Study Circle
    { group: reactGroup._id, title: 'React Hooks Deep Dive', learningObjective: 'Understand useState and useEffect by building a small counter and a fetch example.', agenda: ['useState basics', 'useEffect and dependencies', 'Custom hooks', 'Practical exercise'], topics: ['useState', 'useEffect', 'Custom Hooks'], expectedOutcome: 'Every member can build a component that fetches data and manages its own state.', date: daysFromNow(2), startTime: '18:00', duration: 90, meetingLink: 'https://meet.google.com/react-study-circle', status: 'Upcoming', createdBy: om._id },
    { group: reactGroup._id, title: 'React Components & Props', learningObjective: 'Learn how to split a page into reusable components.', agenda: ['Functional components', 'Props', 'Component composition'], topics: ['Components', 'Props'], expectedOutcome: 'Members can design a component tree for a small app.', date: daysFromNow(-5), startTime: '18:00', duration: 60, status: 'Completed', attendanceMarked: true, createdBy: om._id },
    { group: reactGroup._id, title: 'State Management with Context', learningObjective: 'Compare prop drilling with React Context.', agenda: ['The problem of prop drilling', 'createContext', 'useContext in practice'], topics: ['Context API'], expectedOutcome: 'Members can share state across components without prop drilling.', date: daysFromNow(-14), startTime: '18:30', duration: 75, status: 'Completed', attendanceMarked: true, createdBy: om._id },
    // DSA
    { group: dsaGroup._id, title: 'Graph Traversals Workshop', learningObjective: 'Master BFS and DFS on both trees and graphs.', agenda: ['BFS with a queue', 'DFS recursion', 'Cycle detection', 'Contest problems'], topics: ['BFS', 'DFS', 'Graphs'], expectedOutcome: 'Members can implement BFS/DFS from memory.', date: daysFromNow(3), startTime: '09:00', duration: 120, status: 'Upcoming', createdBy: rahul._id },
    { group: dsaGroup._id, title: 'Dynamic Programming Basics', learningObjective: 'Recognise overlapping subproblems and write memoised solutions.', agenda: ['Recursion revision', 'Memoisation', 'Tabulation', '0/1 Knapsack'], topics: ['DP', 'Memoisation'], expectedOutcome: 'Members can solve 3 standard DP problems.', date: daysFromNow(-8), startTime: '09:00', duration: 90, status: 'Completed', attendanceMarked: true, createdBy: rahul._id },
    // MongoDB
    { group: mongoGroup._id, title: 'Aggregation Pipeline Practice', learningObjective: 'Write $match, $group and $sort stages confidently.', agenda: ['Pipeline stages', '$group and accumulators', '$lookup joins'], topics: ['Aggregation'], expectedOutcome: 'Members can write a multi-stage aggregation query.', date: daysFromNow(1), startTime: '14:00', duration: 60, status: 'Upcoming', createdBy: dhruv._id },
    { group: mongoGroup._id, title: 'Schema Design & Indexing', learningObjective: 'Understand embedding vs referencing.', agenda: ['Embedding vs referencing', 'Index types', 'Query explain plan'], topics: ['Schema Design', 'Indexing'], expectedOutcome: 'Members can design a schema for a small application.', date: daysFromNow(-10), startTime: '14:00', duration: 60, status: 'Completed', attendanceMarked: true, createdBy: dhruv._id },
    // Java OOP
    { group: javaGroup._id, title: 'Interfaces & Abstract Classes', learningObjective: 'Know exactly when to use each.', agenda: ['Abstract classes', 'Interfaces', 'Default methods', 'Exercise'], topics: ['Interfaces', 'Abstraction'], expectedOutcome: 'Members can justify their design choice in code review.', date: daysFromNow(4), startTime: '19:00', duration: 60, status: 'Upcoming', createdBy: aarav._id },
    { group: javaGroup._id, title: 'Singleton & Factory Patterns', learningObjective: 'Implement two creational design patterns.', agenda: ['Why patterns', 'Singleton', 'Factory'], topics: ['Design Patterns'], expectedOutcome: 'Members implement both patterns in Java.', date: daysFromNow(-7), startTime: '19:00', duration: 60, status: 'Completed', attendanceMarked: true, createdBy: aarav._id },
    // Networks
    { group: cnGroup._id, title: 'Subnetting Drills', learningObjective: 'Solve subnetting questions quickly for the exam.', agenda: ['CIDR revision', 'Subnet masks', '10 practice problems'], topics: ['Subnetting', 'IP Addressing'], expectedOutcome: 'Members solve a subnetting question in under 3 minutes.', date: daysFromNow(5), startTime: '10:00', duration: 90, status: 'Upcoming', createdBy: isha._id },
    { group: cnGroup._id, title: 'OSI Model & Packet Capture', learningObjective: 'See the OSI layers in real traffic.', agenda: ['OSI layers', 'Wireshark capture', 'Reading headers'], topics: ['OSI Model', 'Wireshark'], expectedOutcome: 'Members can identify layers in a capture file.', date: daysFromNow(-12), startTime: '10:00', duration: 75, status: 'Completed', attendanceMarked: true, createdBy: isha._id },
    // AI
    { group: aiGroup._id, title: 'Neural Networks from Scratch', learningObjective: 'Build a tiny perceptron in Python.', agenda: ['Perceptron maths', 'Forward pass', 'Training loop', 'Demo'], topics: ['Neural Networks'], expectedOutcome: 'Members train a perceptron on the AND gate.', date: daysFromNow(6), startTime: '15:00', duration: 120, status: 'Upcoming', createdBy: neha._id },
    // OS
    { group: osGroup._id, title: 'CPU Scheduling Algorithms', learningObjective: 'Compare FCFS, SJF and Round Robin with examples.', agenda: ['FCFS', 'SJF', 'Round Robin', 'Numerical practice'], topics: ['Scheduling'], expectedOutcome: 'Members can draw Gantt charts for all three algorithms.', date: daysFromNow(3), startTime: '18:00', duration: 75, status: 'Upcoming', createdBy: karan._id },
    { group: osGroup._id, title: 'Deadlock Detection', learningObjective: 'Use the resource allocation graph safely.', agenda: ['Necessary conditions', 'Banker algorithm', 'Practice'], topics: ['Deadlock'], expectedOutcome: 'Members solve a Banker algorithm numerical.', date: daysFromNow(-3), startTime: '18:00', duration: 60, status: 'Completed', attendanceMarked: true, createdBy: karan._id },
    // Express
    { group: expressGroup._id, title: 'JWT Authentication in Express', learningObjective: 'Protect routes using JSON Web Tokens.', agenda: ['Login route', 'Signing a token', 'Auth middleware', 'Role based access'], topics: ['JWT', 'Middleware'], expectedOutcome: 'Members build a protected /profile route.', date: daysFromNow(2), startTime: '19:30', duration: 90, status: 'Upcoming', createdBy: om._id },
    { group: expressGroup._id, title: 'REST API Design Rules', learningObjective: 'Design clean resource oriented routes.', agenda: ['HTTP verbs', 'Status codes', 'Naming routes'], topics: ['REST', 'HTTP'], expectedOutcome: 'Members design the API for a small app.', date: daysFromNow(-9), startTime: '19:30', duration: 60, status: 'Completed', attendanceMarked: true, createdBy: om._id },
    // Computer organization (cancelled example)
    { group: coGroup._id, title: 'Cache Mapping Revision', learningObjective: 'Revise direct, associative and set associative mapping.', agenda: ['Direct mapping', 'Associative', 'Set associative'], topics: ['Cache Memory'], expectedOutcome: 'Members solve cache hit ratio questions.', date: daysFromNow(-1), startTime: '14:30', duration: 60, status: 'Cancelled', createdBy: dhruv._id },
  ];

  const sessions = await Session.insertMany(sessionSeeds);
  console.log(`   ✓ Created ${sessions.length} study sessions`);

  // ---- attendance for completed sessions ----
  const attendanceDocs = [];
  const completedSessions = sessions.filter((s) => s.status === 'Completed');

  for (const session of completedSessions) {
    const group = groups.find((g) => g._id.toString() === session.group.toString());
    group.members.forEach((member, index) => {
      // deterministic pattern: every 4th member is absent in some sessions
      const isAbsent = (index + session.title.length) % 4 === 3;
      attendanceDocs.push({
        session: session._id,
        group: group._id,
        user: member.user,
        status: isAbsent ? 'Absent' : 'Present',
        markedBy: group.createdBy,
      });
    });
  }
  await Attendance.insertMany(attendanceDocs);
  console.log(`   ✓ Marked attendance for ${completedSessions.length} completed sessions (${attendanceDocs.length} records)`);

  // ---- resources ----
  await Resource.insertMany([
    { group: reactGroup._id, title: 'React Hooks Official Notes', type: 'Notes', url: 'https://react.dev/reference/react/hooks', description: 'Official documentation for every built-in hook with examples.', addedBy: om._id },
    { group: reactGroup._id, title: 'React Crash Course Video', type: 'Video', url: 'https://www.youtube.com/watch?v=SqcY0GlETPk', description: 'Two hour beginner friendly video covering components, props and hooks.', addedBy: rahul._id },
    { group: reactGroup._id, title: 'Component Design Cheat Sheet', type: 'PDF', url: 'https://react.dev/learn/thinking-in-react', description: 'How to break a UI into a component hierarchy.', addedBy: aarav._id },
    { group: dsaGroup._id, title: 'Graph Algorithms Visualiser', type: 'Website', url: 'https://visualgo.net/en/graphds', description: 'Animated visualisations of BFS, DFS and shortest path algorithms.', addedBy: rahul._id },
    { group: dsaGroup._id, title: 'DP Problem List (50 questions)', type: 'Article', url: 'https://leetcode.com/tag/dynamic-programming/', description: 'Curated list we follow for weekly practice.', addedBy: priya._id },
    { group: mongoGroup._id, title: 'MongoDB Manual - Aggregation', type: 'Article', url: 'https://www.mongodb.com/docs/manual/core/aggregation-pipeline/', description: 'Reference for every aggregation stage.', addedBy: dhruv._id },
    { group: mongoGroup._id, title: 'SQL vs NoSQL Comparison Notes', type: 'Notes', url: 'https://www.mongodb.com/nosql-explained', description: 'Class notes comparing relational and document databases.', addedBy: isha._id },
    { group: javaGroup._id, title: 'Java OOP Concepts Playlist', type: 'Video', url: 'https://www.youtube.com/playlist?list=PLsyeobzWxl7pe_IiTfNyr55kwJPWbgxB5', description: 'Playlist we follow for inheritance and polymorphism.', addedBy: aarav._id },
    { group: cnGroup._id, title: 'Subnetting Practice Sheet', type: 'PDF', url: 'https://www.subnetting.net/', description: 'Practice questions with solutions for the exam.', addedBy: isha._id },
    { group: cnGroup._id, title: 'Wireshark Download', type: 'Website', url: 'https://www.wireshark.org/download.html', description: 'Install this before the packet capture session.', addedBy: karan._id },
    { group: osGroup._id, title: 'OS Scheduling Numericals', type: 'Notes', url: 'https://www.geeksforgeeks.org/cpu-scheduling-in-operating-systems/', description: 'Solved numericals for FCFS, SJF and Round Robin.', addedBy: karan._id },
    { group: aiGroup._id, title: 'Machine Learning Crash Course', type: 'Article', url: 'https://developers.google.com/machine-learning/crash-course', description: 'Google course we are following for the basics.', addedBy: neha._id },
    { group: expressGroup._id, title: 'JWT Introduction', type: 'Article', url: 'https://jwt.io/introduction', description: 'How JSON Web Tokens work, structure and verification.', addedBy: om._id },
  ]);
  console.log('   ✓ Shared 13 study resources');

  // ---- announcements ----
  await Announcement.insertMany([
    { group: reactGroup._id, title: "Tomorrow's session has been moved to 6 PM", message: 'Hi everyone, our React Hooks session is shifted from 5 PM to 6 PM because the lab is booked. Please join 5 minutes early with your laptops charged.', postedBy: om._id },
    { group: reactGroup._id, title: 'Please complete the hooks exercise before Monday', message: 'Try the counter exercise from the last session. We will start the next meeting by solving doubts from it.', postedBy: om._id },
    { group: dsaGroup._id, title: 'Graph workshop - bring printed handouts', message: 'We will solve four graph problems together. Handouts will be shared in the resource section, please print or download them before we meet.', postedBy: rahul._id },
    { group: mongoGroup._id, title: 'Install MongoDB Compass before the next session', message: 'We will connect to a real database and run aggregation pipelines. Install MongoDB Community Server plus Compass.', postedBy: dhruv._id },
    { group: javaGroup._id, title: 'Design pattern session moved to Thursday', message: 'Due to the university seminar on Wednesday, our session is moved to Thursday at the same time.', postedBy: aarav._id },
    { group: cnGroup._id, title: 'Subnetting drill results', message: 'Great work everyone. Average score improved from 6/10 to 8/10. Next week we move to routing protocols.', postedBy: isha._id },
  ]);
  console.log('   ✓ Posted 6 announcements');

  console.log('\n✅ Seeding finished successfully!\n');
  console.log('   Demo login accounts (password: studyhub123)');
  console.log('   -----------------------------------------');
  USERS.forEach((u) => console.log(`   ${u.email.padEnd(22)} ${u.name}`));
  console.log('');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (error) => {
  console.error('❌ Seeding failed:', error);
  await mongoose.connection.close();
  process.exit(1);
});
