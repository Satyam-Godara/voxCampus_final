// require('dotenv').config();
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const connectDB = require('./db');

// const User    = require('../models/User');
// const Class   = require('../models/Class');
// const Subject = require('../models/Subject');
// const Channel = require('../models/Channel');

// const seed = async () => {
//   await connectDB();
//   await User.deleteMany({});
//   await Class.deleteMany({});
//   await Subject.deleteMany({});
//   await Channel.deleteMany({});
//   console.log('Cleared existing data...');

//   // ── Classes ───────────────────────────────────────────────────────────
//   const classes = await Class.insertMany([
//     { classId: 'G-19', course: 'CSE', semester: 4, year: 2024, section: 'G-19', displayName: 'CSE-24 Sem-4 G-19' },
//     { classId: 'G-20', course: 'CSE', semester: 4, year: 2024, section: 'G-20', displayName: 'CSE-24 Sem-4 G-20' },
//     { classId: 'G-21', course: 'CSE', semester: 4, year: 2024, section: 'G-21', displayName: 'CSE-24 Sem-4 G-21' },
//     { classId: 'G-22', course: 'ECE', semester: 4, year: 2024, section: 'G-22', displayName: 'ECE-24 Sem-4 G-22' },
//     { classId: 'G-23', course: 'ME',  semester: 4, year: 2024, section: 'G-23', displayName: 'ME-24 Sem-4 G-23'  },
//   ]);
//   const classMap = {};
//   classes.forEach(c => { classMap[c.classId] = c._id; });

//   // ── Subjects (each subject belongs to ONE class) ───────────────────────
//   const g19subs = await Subject.insertMany([
//     { code: 'CSE2301', name: 'Linux Administration',          classRef: classMap['G-19'] },
//     { code: 'CSE0203', name: 'Data Structures & Algorithms',  classRef: classMap['G-19'] },
//     { code: 'CSE2303', name: 'Discrete Structures',           classRef: classMap['G-19'] },
//     { code: 'CSE2304', name: 'Backend Engineering-I',         classRef: classMap['G-19'] },
//   ]);
//   const g20subs = await Subject.insertMany([
//     { code: 'CSE2301', name: 'Linux Administration',          classRef: classMap['G-20'] },
//     { code: 'CSE0203', name: 'Data Structures & Algorithms',  classRef: classMap['G-20'] },
//     { code: 'CSE2303', name: 'Discrete Structures',           classRef: classMap['G-20'] },
//     { code: 'CSE2304', name: 'Backend Engineering-I',         classRef: classMap['G-20'] },
//   ]);
//   const g21subs = await Subject.insertMany([
//     { code: 'CSE2301', name: 'Linux Administration',          classRef: classMap['G-21'] },
//     { code: 'CSE0203', name: 'Data Structures & Algorithms',  classRef: classMap['G-21'] },
//     { code: 'CSE2303', name: 'Discrete Structures',           classRef: classMap['G-21'] },
//     { code: 'CSE2305', name: 'Web Technologies',              classRef: classMap['G-21'] },
//   ]);
//   const g22subs = await Subject.insertMany([
//     { code: 'ECE2301', name: 'Signals & Systems',             classRef: classMap['G-22'] },
//     { code: 'ECE2302', name: 'Digital Electronics',           classRef: classMap['G-22'] },
//     { code: 'ECE2303', name: 'Electromagnetic Fields',        classRef: classMap['G-22'] },
//   ]);
//   const g23subs = await Subject.insertMany([
//     { code: 'ME2301',  name: 'Thermodynamics',                classRef: classMap['G-23'] },
//     { code: 'ME2302',  name: 'Fluid Mechanics',               classRef: classMap['G-23'] },
//     { code: 'ME2303',  name: 'Manufacturing Processes',       classRef: classMap['G-23'] },
//   ]);
//   console.log('Subjects created...');

//   // Helper: find subject _id by code within a class's subjects array
//   const findSub = (subsArr, code) => subsArr.find(s => s.code === code)?._id;

//   // ── Channels ─────────────────────────────────────────────────────────
//   await Channel.insertMany([
//     { name: 'General',    type: 'general',    isGlobal: true, studentOnly: true, description: 'Campus-wide social feed' },
//     { name: 'Feedback',   type: 'feedback',   isGlobal: true, studentOnly: true, description: 'Vote-ranked institutional feedback' },
//     { name: 'Complaints', type: 'complaints', isGlobal: true, studentOnly: true, description: 'Anonymous complaints board' },
//   ]);

//   // One subject-channel per (subject, class) pair
//   const allSubs = [...g19subs, ...g20subs, ...g21subs, ...g22subs, ...g23subs];
//   await Channel.insertMany(allSubs.map(s => ({
//     name:        `${s.code} · ${s.name}`,
//     type:        'subject',
//     isGlobal:    false,
//     studentOnly: false,
//     subjectRef:  s._id,
//     classRef:    s.classRef,
//     description: `Class chat for ${s.name}`,
//   })));
//   console.log('Channels created...');

//   // ── Admin ─────────────────────────────────────────────────────────────
//   await User.create({
//     rollNo:     'ADMIN001',
//     realName:   'Dr. S.K. Mishra',
//     email:      'admin@chitkara.edu.in',
//     password:   await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin@voxcampus', 10),
//     role:       'admin',
//     anonAlias:  'Admin',
//     isVerified: true,
//   });

//   // ── Teachers — teacherAssignments: [{classRef, subjectRefs[]}] ─────────
//   // Each entry means: in this class, this teacher handles these subjects
//   const teacherData = [
//     {
//       rollNo: 'TCH001', name: 'Dr. Rajesh Kumar',  email: 'rajesh.kumar@chitkara.edu.in',
//       skillTags: ['Linux', 'System Administration', 'Shell Scripting'],
//       assignments: [
//         { classId: 'G-19', codes: ['CSE2301'] },
//         { classId: 'G-20', codes: ['CSE2301'] },
//       ],
//     },
//     {
//       rollNo: 'TCH002', name: 'Prof. Sunita Bose', email: 'sunita.bose@chitkara.edu.in',
//       skillTags: ['DSA', 'Algorithms', 'Data Structures', 'Competitive Programming'],
//       assignments: [
//         { classId: 'G-19', codes: ['CSE0203'] },
//         { classId: 'G-20', codes: ['CSE0203'] },
//       ],
//     },
//     {
//       rollNo: 'TCH003', name: 'Dr. Anil Sharma',   email: 'anil.sharma@chitkara.edu.in',
//       skillTags: ['Discrete Maths', 'Graph Theory', 'Logic'],
//       assignments: [
//         { classId: 'G-19', codes: ['CSE2303'] },
//         { classId: 'G-20', codes: ['CSE2303'] },
//       ],
//     },
//     {
//       rollNo: 'TCH004', name: 'Prof. Priya Nair',  email: 'priya.nair@chitkara.edu.in',
//       skillTags: ['Node.js', 'Express', 'REST API', 'Backend Engineering'],
//       assignments: [
//         { classId: 'G-19', codes: ['CSE2304'] },
//         { classId: 'G-20', codes: ['CSE2304'] },
//       ],
//     },
//     {
//       rollNo: 'TCH005', name: 'Dr. Meera Verma',   email: 'meera.verma@chitkara.edu.in',
//       skillTags: ['Linux', 'DSA', 'Web Technologies', 'Discrete Maths'],
//       assignments: [
//         { classId: 'G-21', codes: ['CSE2301', 'CSE0203', 'CSE2303', 'CSE2305'] },
//       ],
//     },
//     {
//       rollNo: 'TCH006', name: 'Prof. Suresh Iyer', email: 'suresh.iyer@chitkara.edu.in',
//       skillTags: ['Signals', 'Electronics', 'Electromagnetic Fields'],
//       assignments: [
//         { classId: 'G-22', codes: ['ECE2301', 'ECE2302', 'ECE2303'] },
//       ],
//     },
//     {
//       rollNo: 'TCH007', name: 'Dr. Ramesh Tiwari', email: 'ramesh.tiwari@chitkara.edu.in',
//       skillTags: ['Thermodynamics', 'Fluid Mechanics', 'Manufacturing'],
//       assignments: [
//         { classId: 'G-23', codes: ['ME2301', 'ME2302', 'ME2303'] },
//       ],
//     },
//   ];

//   // Build a lookup: classId -> subjects array
//   const subsMap = { 'G-19': g19subs, 'G-20': g20subs, 'G-21': g21subs, 'G-22': g22subs, 'G-23': g23subs };

//   for (const t of teacherData) {
//     const teacherAssignments = t.assignments.map(a => ({
//       classRef:    classMap[a.classId],
//       subjectRefs: a.codes.map(code => findSub(subsMap[a.classId], code)).filter(Boolean),
//     }));
//     await User.create({
//       rollNo:     t.rollNo,
//       realName:   t.name,
//       email:      t.email,
//       password:   await bcrypt.hash('teacher@123', 10),
//       role:       'teacher',
//       anonAlias:  `Teacher`,
//       skillTags:  t.skillTags,
//       teacherAssignments,
//       isVerified: true,
//     });
//   }
//   console.log('Teachers created...');

//   // ── Students ──────────────────────────────────────────────────────────
//   const studentData = [
//     { rollNo: '2410991517', name: 'Satyam Godara',       email: 'satyam1517.becse24@chitkara.edu.in',     classId: 'G-19' },
//     { rollNo: '2410991518', name: 'Aarav Sharma',        email: 'aarav1518.becse24@chitkara.edu.in',      classId: 'G-19' },
//     { rollNo: '2410991519', name: 'Priya Verma',         email: 'priya1519.becse24@chitkara.edu.in',      classId: 'G-19' },
//     { rollNo: '2410991520', name: 'Rohan Mehta',         email: 'rohan1520.becse24@chitkara.edu.in',      classId: 'G-19' },
//     { rollNo: '2410991521', name: 'Sneha Gupta',         email: 'sneha1521.becse24@chitkara.edu.in',      classId: 'G-19' },
//     { rollNo: '2410991522', name: 'Karan Singh',         email: 'karan1522.becse24@chitkara.edu.in',      classId: 'G-19' },
//     { rollNo: '2410991523', name: 'Divya Nair',          email: 'divya1523.becse24@chitkara.edu.in',      classId: 'G-19' },
//     { rollNo: '2410991524', name: 'Arjun Patel',         email: 'arjun1524.becse24@chitkara.edu.in',      classId: 'G-19' },
//     { rollNo: '2410991525', name: 'Meera Iyer',          email: 'meera1525.becse24@chitkara.edu.in',      classId: 'G-19' },
//     { rollNo: '2410991526', name: 'Vikram Rao',          email: 'vikram1526.becse24@chitkara.edu.in',     classId: 'G-19' },
//     { rollNo: '2410992001', name: 'Ananya Joshi',        email: 'ananya2001.becse24@chitkara.edu.in',     classId: 'G-20' },
//     { rollNo: '2410992002', name: 'Nikhil Kumar',        email: 'nikhil2002.becse24@chitkara.edu.in',     classId: 'G-20' },
//     { rollNo: '2410992003', name: 'Pooja Reddy',         email: 'pooja2003.becse24@chitkara.edu.in',      classId: 'G-20' },
//     { rollNo: '2410992004', name: 'Rahul Das',           email: 'rahul2004.becse24@chitkara.edu.in',      classId: 'G-20' },
//     { rollNo: '2410992005', name: 'Isha Mishra',         email: 'isha2005.becse24@chitkara.edu.in',       classId: 'G-20' },
//     { rollNo: '2410993001', name: 'Amit Tiwari',         email: 'amit3001.becse24@chitkara.edu.in',       classId: 'G-21' },
//     { rollNo: '2410993002', name: 'Neha Saxena',         email: 'neha3002.becse24@chitkara.edu.in',       classId: 'G-21' },
//     { rollNo: '2410993003', name: 'Siddharth Roy',       email: 'siddharth3003.becse24@chitkara.edu.in',  classId: 'G-21' },
//     { rollNo: '2410994001', name: 'Tanvi Bhatt',         email: 'tanvi4001.becece24@chitkara.edu.in',     classId: 'G-22' },
//     { rollNo: '2410994002', name: 'Ravi Sinha',          email: 'ravi4002.becece24@chitkara.edu.in',      classId: 'G-22' },
//     { rollNo: '2410995001', name: 'Gaurav Dubey',        email: 'gaurav5001.becme24@chitkara.edu.in',     classId: 'G-23' },
//     { rollNo: '2410995002', name: 'Ritu Pandey',         email: 'ritu5002.becme24@chitkara.edu.in',       classId: 'G-23' },
//   ];

//   for (const s of studentData) {
//     const aliasNum = parseInt(s.rollNo.slice(-4)) % 9000 + 1000;
//     await User.create({
//       rollNo:     s.rollNo,
//       realName:   s.name,
//       email:      s.email,
//       password:   await bcrypt.hash(s.rollNo, 10),
//       role:       'student',
//       classRef:   classMap[s.classId],
//       anonAlias:  `Student#${aliasNum}`,
//       isVerified: true,
//     });
//   }
//   console.log('Students created...');

//   console.log('\n✅ Seed complete!');
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//   console.log('  Student  → 2410991517  / 2410991517');
//   console.log('  Teacher  → TCH001      / teacher@123');
//   console.log('  Admin    → ADMIN001    / admin@voxcampus');
//   console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//   mongoose.disconnect();
// };

// seed().catch(err => { console.error(err); mongoose.disconnect(); });




require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const connectDB = require('./db');

const User    = require('../models/User');
const Class   = require('../models/Class');
const Subject = require('../models/Subject');
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const Post    = require('../models/Post');
const Poll    = require('../models/Poll');

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}), Class.deleteMany({}),
    Subject.deleteMany({}), Channel.deleteMany({}),
    Message.deleteMany({}), Post.deleteMany({}),
    Poll.deleteMany({}),
  ]);
  console.log('🗑  Cleared existing data');

  // ──────────────────────────────────────────────────────────────────
  // 1. CLASSES
  // ──────────────────────────────────────────────────────────────────
  const classData = [
    // CSE Batch 2024 (current 2nd year, Sem 4)
    { classId:'G-11', course:'CSE', semester:4, year:2024, section:'G-11', displayName:'CSE-24 Sem-4 G-11' },
    { classId:'G-12', course:'CSE', semester:4, year:2024, section:'G-12', displayName:'CSE-24 Sem-4 G-12' },
    { classId:'G-13', course:'CSE', semester:4, year:2024, section:'G-13', displayName:'CSE-24 Sem-4 G-13' },
    { classId:'G-14', course:'CSE', semester:4, year:2024, section:'G-14', displayName:'CSE-24 Sem-4 G-14' },
    { classId:'G-15', course:'CSE', semester:4, year:2024, section:'G-15', displayName:'CSE-24 Sem-4 G-15' },
    { classId:'G-16', course:'CSE', semester:4, year:2024, section:'G-16', displayName:'CSE-24 Sem-4 G-16' },
    { classId:'G-17', course:'CSE', semester:4, year:2024, section:'G-17', displayName:'CSE-24 Sem-4 G-17' },
    { classId:'G-18', course:'CSE', semester:4, year:2024, section:'G-18', displayName:'CSE-24 Sem-4 G-18' },
    { classId:'G-19', course:'CSE', semester:4, year:2024, section:'G-19', displayName:'CSE-24 Sem-4 G-19' },
    { classId:'G-20', course:'CSE', semester:4, year:2024, section:'G-20', displayName:'CSE-24 Sem-4 G-20' },
    { classId:'G-21', course:'CSE', semester:4, year:2024, section:'G-21', displayName:'CSE-24 Sem-4 G-21' },
    { classId:'G-22', course:'CSE', semester:4, year:2024, section:'G-22', displayName:'CSE-24 Sem-4 G-22' },
  ];
  const classes = await Class.insertMany(classData);
  const classMap = {};
  classes.forEach(c => { classMap[c.classId] = c._id; });
  console.log(`✅ ${classes.length} classes created`);

  // ──────────────────────────────────────────────────────────────────
  // 2. SUBJECTS — each subject belongs to one class
  // ──────────────────────────────────────────────────────────────────
  const subjectData = [
    // G-11 CSE Sem 4 
    { code:'24CSE0213', name:'Linux Administration',         classId:'G-11' },
    { code:'24CSE0212', name:'Data Structures using Object Oriented Programming-II', classId:'G-11' },
    { code:'24ECE0202', name:'Embedded System and Internet of Things',          classId:'G-11' },
    { code:'24CSE0214', name:'Backend Engineering-I',      classId:'G-11' },
    { code:'24CSE0215', name:'Computer Networks',          classId:'G-11' },
    // G-12 CSE Sem 4 
    { code:'24CSE0213', name:'Linux Administration',         classId:'G-12' },
    { code:'24CSE0212', name:'Data Structures using Object Oriented Programming-II', classId:'G-12' },
    { code:'24ECE0202', name:'Embedded System and Internet of Things',          classId:'G-12' },
    { code:'24CSE0214', name:'Backend Engineering-I',      classId:'G-12' },
    { code:'24CSE0215', name:'Computer Networks',          classId:'G-12' },
    // G-13 CSE Sem 4 
    { code:'24CSE0213', name:'Linux Administration',         classId:'G-13' },
    { code:'24CSE0212', name:'Data Structures using Object Oriented Programming-II', classId:'G-13' },
    { code:'24ECE0202', name:'Embedded System and Internet of Things',          classId:'G-13' },
    { code:'24CSE0214', name:'Backend Engineering-I',      classId:'G-13' },
    { code:'24CSE0215', name:'Computer Networks',          classId:'G-13' },
    // G-14 CSE Sem 4 
    { code:'24CSE0213', name:'Linux Administration',         classId:'G-14' },
    { code:'24CSE0212', name:'Data Structures using Object Oriented Programming-II', classId:'G-14' },
    { code:'24ECE0202', name:'Embedded System and Internet of Things',          classId:'G-14' },
    { code:'24CSE0214', name:'Backend Engineering-I',      classId:'G-14' },
    { code:'24CSE0215', name:'Computer Networks',          classId:'G-14' },
    // G-15 CSE Sem 4 
    { code:'24CSE0213', name:'Linux Administration',         classId:'G-15' },
    { code:'24CSE0212', name:'Data Structures using Object Oriented Programming-II', classId:'G-15' },
    { code:'24ECE0202', name:'Embedded System and Internet of Things',          classId:'G-15' },
    { code:'24CSE0214', name:'Backend Engineering-I',      classId:'G-15' },
    { code:'24CSE0215', name:'Computer Networks',          classId:'G-15' },
    // G-16 CSE Sem 4 
    { code:'24CSE0213', name:'Linux Administration',         classId:'G-16' },
    { code:'24CSE0212', name:'Data Structures using Object Oriented Programming-II', classId:'G-16' },
    { code:'24ECE0202', name:'Embedded System and Internet of Things',          classId:'G-16' },
    { code:'24CSE0214', name:'Backend Engineering-I',      classId:'G-16' },
    { code:'24CSE0215', name:'Computer Networks',          classId:'G-16' },
    // G-17 CSE Sem 4 
    { code:'24CSE0213', name:'Linux Administration',         classId:'G-17' },
    { code:'24CSE0212', name:'Data Structures using Object Oriented Programming-II', classId:'G-17' },
    { code:'24APS0105', name:'Discrete Structures',          classId:'G-17' },
    { code:'24CSE0214', name:'Backend Engineering-I',      classId:'G-17' },
    { code:'24CSE0215', name:'Computer Networks',          classId:'G-17' },
    // G-18 CSE Sem 4 
    { code:'24CSE0213', name:'Linux Administration',         classId:'G-18' },
    { code:'24CSE0212', name:'Data Structures using Object Oriented Programming-II', classId:'G-18' },
    { code:'24APS0105', name:'Discrete Structures',          classId:'G-18' },
    { code:'24CSE0214', name:'Backend Engineering-I',      classId:'G-18' },
    { code:'24CSE0215', name:'Computer Networks',          classId:'G-18' },
    // G-19 CSE Sem 4 
    { code:'24CSE0213', name:'Linux Administration',         classId:'G-19' },
    { code:'24CSE0212', name:'Data Structures using Object Oriented Programming-II', classId:'G-19' },
    { code:'24APS0105', name:'Discrete Structures',          classId:'G-19' },
    { code:'24CSE0214', name:'Backend Engineering-I',      classId:'G-19' },
    { code:'24CSE0215', name:'Computer Networks',          classId:'G-19' },
    // G-20 CSE Sem 4 
    { code:'24CSE0213', name:'Linux Administration',         classId:'G-20' },
    { code:'24CSE0212', name:'Data Structures using Object Oriented Programming-II', classId:'G-20' },
    { code:'24APS0105', name:'Discrete Structures',          classId:'G-20' },
    { code:'24CSE0214', name:'Backend Engineering-I',      classId:'G-20' },
    { code:'24CSE0215', name:'Computer Networks',          classId:'G-20' },
    // G-21 CSE Sem 4 
    { code:'24CSE0213', name:'Linux Administration',         classId:'G-21' },
    { code:'24CSE0212', name:'Data Structures using Object Oriented Programming-II', classId:'G-21' },
    { code:'24APS0105', name:'Discrete Structures',          classId:'G-21' },
    { code:'24CSE0214', name:'Backend Engineering-I',      classId:'G-21' },
    { code:'24CSE0215', name:'Computer Networks',          classId:'G-21' },
    // G-22 CSE Sem 4 
    { code:'24CSE0213', name:'Linux Administration',         classId:'G-22' },
    { code:'24CSE0212', name:'Data Structures using Object Oriented Programming-II', classId:'G-22' },
    { code:'24APS0105', name:'Discrete Structures',          classId:'G-22' },
    { code:'24CSE0214', name:'Backend Engineering-I',      classId:'G-22' },
    { code:'24CSE0215', name:'Computer Networks',          classId:'G-22' },
   
  ];

  const subjects = await Subject.insertMany(
    subjectData.map(s => ({ code:s.code, name:s.name, classRef:classMap[s.classId] }))
  );
  // Build lookup: classId + code → Subject doc
  const subMap = {};
  subjects.forEach(s => {
    const cls = classes.find(c => c._id.equals(s.classRef));
    if (cls) subMap[`${cls.classId}__${s.code}`] = s;
  });
  console.log(`✅ ${subjects.length} subjects created`);

  // ──────────────────────────────────────────────────────────────────
  // 3. CHANNELS
  // ──────────────────────────────────────────────────────────────────
  await Channel.insertMany([
    { name:'General',    type:'general',    isGlobal:true, studentOnly:true, description:'Campus-wide social feed' },
    { name:'Feedback',   type:'feedback',   isGlobal:true, studentOnly:true, description:'Vote-ranked institutional feedback' },
    { name:'Complaints', type:'complaints', isGlobal:true, studentOnly:true, description:'Anonymous complaints board' },
  ]);

  // One subject channel per subject document
  const subjectChannels = await Channel.insertMany(
    subjects.map(s => {
      const cls = classes.find(c => c._id.equals(s.classRef));
      return {
        name: `${s.code} · ${s.name}`,
        type: 'subject', isGlobal:false, studentOnly:false,
        subjectRef: s._id, classRef: s.classRef,
        description: `Class chat for ${s.name} — ${cls?.displayName || ''}`,
      };
    })
  );
  // Build channelMap: subject._id string → channel._id
  const subjectChannelMap = {};
  subjectChannels.forEach(ch => {
    subjectChannelMap[String(ch.subjectRef)] = ch._id;
  });
  console.log(`✅ ${3 + subjectChannels.length} channels created`);

  // ──────────────────────────────────────────────────────────────────
  // 4. ADMIN
  // ──────────────────────────────────────────────────────────────────
  await User.create({
    rollNo:'ADMIN001', realName:'ADMIN', email:'admin@chitkara.edu.in',
    password: await bcrypt.hash('admin@voxcampus', 10),
    role:'admin', anonAlias:'Admin', isVerified:true,
  });

  // ──────────────────────────────────────────────────────────────────
  // 5. TEACHERS
  // Each assignment: { classId, codes[] }
  // ──────────────────────────────────────────────────────────────────
  const teacherDefs = [
    {
      rollNo:'TCH26002', name:'Simran Saini',    email:'simran@myanatomy.in',
      skills:['Linux','System Administration','Shell Scripting'],
    },
    {
      rollNo:'TCH26003', name:'Pawan Agrahari',   email:'pawan@myanatomy.in',
      skills:['DSA','Algorithms','Competitive Programming'],
    },
    {
      rollNo:'TCH26004', name:'Gurpreet Singh',     email:'gurpreet.singh@chitkara.edu.in',
      skills:['Discrete Maths','Graph Theory','Logic','Combinatorics'],
    },
    {
      rollNo:'TCH26001', name:'Preenu Mittan',    email:'preenu@myanatomy.in',
      skills:['Node.js','Express','REST API','Backend Engineering'],
    },
    {
      rollNo:'TCH26005', name:'Aditya Kumar',     email:'aditya.kumar@chitkara.edu.in',
      skills:['Electronics','Signals','Electromagnetic Theory'],
    },
    
  ];

  const teacherDocs = [];
  for (const t of teacherDefs) {
  //   const teacherAssignments = t.assignments.map(a => {
  //     const subjectRefs = a.codes
  //       .map(code => subMap[`${a.classId}__${code}`]?._id)
  //       .filter(Boolean);
  //     return { classRef: classMap[a.classId], subjectRefs };
  //   }).filter(a => a.classRef);

    const doc = await User.create({
      rollNo: t.rollNo, realName: t.name, email: t.email,
      password: await bcrypt.hash('teacher@123', 10),
      role: 'teacher', anonAlias: 'Teacher',
      skillTags: t.skills,
      isVerified: true, isPendingApproval: false,
    });
    teacherDocs.push(doc);
  }
  console.log(`✅ ${teacherDocs.length} teachers created`);

  // ──────────────────────────────────────────────────────────────────
  // 6. STUDENTS
  // ──────────────────────────────────────────────────────────────────
  const studentData = [
    // ── G-19 (Satyam's class) ──────────────────────────────────────
    { rollNo:'2410991517', name:'Satyam Godara',      email:'satyam1517.becse24@chitkara.edu.in',  classId:'G-19' },
    { rollNo:'2410991513', name:'Aarav Sharma',       email:'aarav1513.becse24@chitkara.edu.in',   classId:'G-19' },
    { rollNo:'2410991519', name:'Priya Verma',        email:'priya1519.becse24@chitkara.edu.in',   classId:'G-19' },
    { rollNo:'2410991520', name:'Rohan Mehta',        email:'rohan1520.becse24@chitkara.edu.in',   classId:'G-19' },
    { rollNo:'2410991521', name:'Sneha Gupta',        email:'sneha1521.becse24@chitkara.edu.in',   classId:'G-19' },
    { rollNo:'2410991522', name:'Karan Singh',        email:'karan1522.becse24@chitkara.edu.in',   classId:'G-19' },
    { rollNo:'2410991523', name:'Divya Nair',         email:'divya1523.becse24@chitkara.edu.in',   classId:'G-19' },
    { rollNo:'2410991524', name:'Arjun Patel',        email:'arjun1524.becse24@chitkara.edu.in',   classId:'G-19' },
    // ── G-20 ───────────────────────────────────────────────────────
    { rollNo:'2410991101', name:'Ananya Joshi',       email:'ananya2001.becse24@chitkara.edu.in',  classId:'G-20' },
    { rollNo:'2410991102', name:'Nikhil Kumar',       email:'nikhil2002.becse24@chitkara.edu.in',  classId:'G-20' },
    { rollNo:'2410991103', name:'Pooja Reddy',        email:'pooja2003.becse24@chitkara.edu.in',   classId:'G-20' },
    { rollNo:'2410991104', name:'Rahul Das',          email:'rahul2004.becse24@chitkara.edu.in',   classId:'G-20' },
    { rollNo:'2410991105', name:'Isha Mishra',        email:'isha2005.becse24@chitkara.edu.in',    classId:'G-20' },
    // ── G-21 ───────────────────────────────────────────────────────
    { rollNo:'2410991001', name:'Amit Tiwari',        email:'amit3001.becse24@chitkara.edu.in',    classId:'G-21' },
    { rollNo:'2410991002', name:'Neha Saxena',        email:'neha3002.becse24@chitkara.edu.in',    classId:'G-21' },
    { rollNo:'2410991003', name:'Siddharth Roy',      email:'siddharth3003.becse24@chitkara.edu.in',classId:'G-21' },
    { rollNo:'2410991004', name:'Kavya Pillai',       email:'kavya3004.becse24@chitkara.edu.in',   classId:'G-21' },
    // ── G-05 CSE Sem 6 ─────────────────────────────────────────────
    { rollNo:'2310990501', name:'Harsh Agarwal',      email:'harsh0501.becse23@chitkara.edu.in',   classId:'G-11' },
    { rollNo:'2310990502', name:'Riya Khanna',        email:'riya0502.becse23@chitkara.edu.in',    classId:'G-11' },
    { rollNo:'2310990503', name:'Varun Bhatia',       email:'varun0503.becse23@chitkara.edu.in',   classId:'G-11' },
    { rollNo:'2310990504', name:'Shreya Jain',        email:'shreya0504.becse23@chitkara.edu.in',  classId:'G-11' },
    // ── G-06 CSE Sem 6 ─────────────────────────────────────────────
    { rollNo:'2310990601', name:'Mohit Bansal',       email:'mohit0601.becse23@chitkara.edu.in',   classId:'G-12' },
    { rollNo:'2310990602', name:'Swati Goyal',        email:'swati0602.becse23@chitkara.edu.in',   classId:'G-12' },
    { rollNo:'2310990603', name:'Aryan Chopra',       email:'aryan0603.becse23@chitkara.edu.in',   classId:'G-12' },
    // ── G-22 ECE ───────────────────────────────────────────────────
    { rollNo:'2410994001', name:'Tanvi Bhatt',        email:'tanvi4001.becece24@chitkara.edu.in',  classId:'G-22' },
    { rollNo:'2410994002', name:'Ravi Sinha',         email:'ravi4002.becece24@chitkara.edu.in',   classId:'G-22' },
    { rollNo:'2410994003', name:'Simran Kaur',        email:'simran4003.becece24@chitkara.edu.in', classId:'G-22' },
    { rollNo:'2410994004', name:'Deepak Yadav',       email:'deepak4004.becece24@chitkara.edu.in', classId:'G-22' },
    // ── G-23 ME ────────────────────────────────────────────────────
    { rollNo:'2410995001', name:'Gaurav Dubey',       email:'gaurav5001.becme24@chitkara.edu.in',  classId:'G-13' },
    { rollNo:'2410995002', name:'Ritu Pandey',        email:'ritu5002.becme24@chitkara.edu.in',    classId:'G-13' },
    { rollNo:'2410995003', name:'Akash Jain',         email:'akash5003.becme24@chitkara.edu.in',   classId:'G-13' },
    { rollNo:'2410995004', name:'Preethi Nair',       email:'preethi5004.becme24@chitkara.edu.in', classId:'G-13' },
    // ── G-30 BBA ───────────────────────────────────────────────────
    { rollNo:'2410996001', name:'Aisha Khan',         email:'aisha6001.becbba24@chitkara.edu.in',  classId:'G-14' },
    { rollNo:'2410996002', name:'Raj Malhotra',       email:'raj6002.becbba24@chitkara.edu.in',    classId:'G-14' },
    { rollNo:'2410996003', name:'Nisha Gupta',        email:'nisha6003.becbba24@chitkara.edu.in',  classId:'G-14' },
    { rollNo:'2410996004', name:'Vikash Soni',        email:'vikash6004.becbba24@chitkara.edu.in', classId:'G-14' },
  ];

  const studentDocs = [];
  for (const s of studentData) {
    const aliasNum = parseInt(s.rollNo.slice(-4)) % 9000 + 1000;
    const doc = await User.create({
      rollNo: s.rollNo, realName: s.name, email: s.email,
      password: await bcrypt.hash(s.rollNo, 10),
      role: 'student', classRef: classMap[s.classId],
      anonAlias: `Student#${aliasNum}`,
      isVerified: true,
    });
    studentDocs.push(doc);
  }
  console.log(`✅ ${studentDocs.length} students created`);

  // ──────────────────────────────────────────────────────────────────
  // 7. DEMO MESSAGES in G-19 Linux channel
  // ──────────────────────────────────────────────────────────────────
  const linuxChannel = subjectChannels.find(ch => {
    const subj = subjects.find(s => s._id.equals(ch.subjectRef));
    return subj?.code === '24CSE0213' && String(subj.classRef) === String(classMap['G-19']);
  });

  const teacher1 = teacherDocs.find(t => t.rollNo === 'TCH26002');
  const satyam   = studentDocs.find(s => s.rollNo === '2410991517');
  const aarav    = studentDocs.find(s => s.rollNo === '2410991513');

  if (linuxChannel && teacher1 && satyam) {
    const now = new Date();
    await Message.insertMany([
      {
        channelRef: linuxChannel._id, authorRef: teacher1._id,
        anonAlias: teacher1.realName, type: 'announcement',
        content: 'Assignment 1 is due this Friday. Upload to the portal by 11:59 PM.',
        announcementMeta: { category:'assignment', dueDate: new Date(now.getTime() + 4*24*60*60*1000) },
        createdAt: new Date(now.getTime() - 3*60*60*1000),
      },
      {
        channelRef: linuxChannel._id, authorRef: satyam._id,
        anonAlias: satyam.anonAlias, type: 'chat',
        content: 'Mam can we use WSL2 for the assignment or only native Linux?',
        createdAt: new Date(now.getTime() - 2*60*60*1000),
      },
      {
        channelRef: linuxChannel._id, authorRef: teacher1._id,
        anonAlias: teacher1.realName, type: 'chat',
        content: 'WSL2 is fine for the assignment. Just make sure you document your environment.',
        createdAt: new Date(now.getTime() - 1.5*60*60*1000),
      },
      {
        channelRef: linuxChannel._id, authorRef: aarav._id,
        anonAlias: aarav.anonAlias, type: 'chat',
        content: 'Can someone share a good resource for cron jobs? Getting confused with the syntax.',
        createdAt: new Date(now.getTime() - 1*60*60*1000),
      },
    ]);

    // Demo poll
    const poll = await Poll.create({
      channelRef: linuxChannel._id,
      createdBy: teacher1._id,
      question: 'Which Linux topic do you find most difficult?',
      options: [
        { text: 'Process management', votes: [satyam._id] },
        { text: 'File permissions & ACL', votes: [aarav._id] },
        { text: 'Cron jobs & scheduling', votes: [] },
        { text: 'Network configuration', votes: [] },
      ],
      closesAt: new Date(now.getTime() + 3*24*60*60*1000),
    });
    console.log(`✅ Demo messages and poll created in ${linuxChannel.name}`);
  }

  // ──────────────────────────────────────────────────────────────────
  // 8. DEMO POSTS in General feed
  // ──────────────────────────────────────────────────────────────────
  const globalChannels = await Channel.find({ isGlobal:true });
  const generalCh  = globalChannels.find(c => c.type === 'general');
  const feedbackCh = globalChannels.find(c => c.type === 'feedback');

  if (generalCh && satyam && aarav) {
    await Post.insertMany([
      {
        channelRef: generalCh._id,
        authorRef:  satyam._id,
        anonAlias:  satyam.anonAlias,
        content:    'Anyone else struggling with the DSA assignment? The binary tree questions are brutal 😅',
        upvotes:    [aarav._id],
        voteScore:  1,
        comments: [
          { authorRef: aarav._id, anonAlias: aarav.anonAlias, content: 'Same! Spent 3 hours on the AVL tree rotation yesterday.' },
        ],
      },
      {
        channelRef: generalCh._id,
        authorRef:  aarav._id,
        anonAlias:  aarav.anonAlias,
        content:    'The cafeteria is closed tomorrow for maintenance — heads up to everyone who usually eats there!',
        upvotes:    [satyam._id],
        voteScore:  1,
        comments:   [],
      },
    ]);

    if (feedbackCh) {
      await Post.insertMany([
        {
          channelRef: feedbackCh._id,
          authorRef:  satyam._id,
          anonAlias:  satyam.anonAlias,
          content:    'The library should extend its closing time to 11 PM during exam season. Many students need quiet study space in the evenings.',
          upvotes:    [aarav._id],
          voteScore:  1,
          comments:   [],
        },
      ]);
    }
    console.log('✅ Demo posts created in General and Feedback feeds');
  }

  // ──────────────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CLASSES:');
  classData.forEach(c => console.log(`  ${c.classId.padEnd(6)} ${c.displayName}`));
  console.log('\nLOGIN CREDENTIALS:');
  console.log('  Student  →  2410991517   /  2410991517    (Satyam, G-19)');
  console.log('  Teacher  →  TCH26001       /  teacher@123   (Dr. Rajesh Kumar)');
  console.log('  Admin    →  ADMIN001     /  admin@voxcampus');
  console.log('\nALL TEACHER IDs: TCH001 – TCH011 (password: teacher@123)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  mongoose.disconnect();
};

seed().catch(err => { console.error('Seed error:', err); mongoose.disconnect(); });