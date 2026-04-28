// const express   = require('express');
// const router    = express.Router();
// const bcrypt    = require('bcryptjs');
// const jwt       = require('jsonwebtoken');
// const User      = require('../models/User');
// const Class     = require('../models/Class');
// const Subject   = require('../models/Subject');
// const Channel   = require('../models/Channel');
// const { sendOTP } = require('../config/mailer');
// const { auth }    = require('../middleware/auth');

// // ─────────────────────────────────────────────────────────────────────────────
// // Helpers
// // ─────────────────────────────────────────────────────────────────────────────

// function genOTP() {
//   return String(Math.floor(100000 + Math.random() * 900000));
// }

// /**
//  * Build the channel list shown in the sidebar for a given user.
//  * The user document must already have teacherAssignments populated
//  * (classRef + subjectRefs) when calling this for a teacher.
//  */
// async function buildChannels(user) {
//   // Admin sees every non-DM channel
//   if (user.role === 'admin') {
//     return Channel.find({ type: { $ne: 'dm' } })
//       .populate('subjectRef')
//       .populate('classRef')
//       .lean();
//   }

//   // Student: global channels + all subjects of their class
//   if (user.role === 'student') {
//     const classId = user.classRef?._id || user.classRef;
//     const [globals, subjectChannels] = await Promise.all([
//       Channel.find({ isGlobal: true }).lean(),
//       Channel.find({ type: 'subject', classRef: classId })
//         .populate('subjectRef')
//         .populate('classRef')
//         .lean(),
//     ]);
//     return [...globals, ...subjectChannels];
//   }

//   // Teacher: ONLY the subject channels they are assigned to — no global channels
//   if (user.role === 'teacher') {
//     const assignments = user.teacherAssignments || [];
//     if (!assignments.length) return [];

//     // Collect all (classRef, subjectRef) pairs this teacher owns
//     const classIds   = assignments.map(a => a.classRef?._id || a.classRef);
//     const subjectIds = assignments.flatMap(a =>
//       (a.subjectRefs || []).map(s => s._id || s)
//     );

//     if (!subjectIds.length) return [];

//     const subjectChannels = await Channel.find({
//       type:       'subject',
//       classRef:   { $in: classIds },
//       subjectRef: { $in: subjectIds },
//     })
//       .populate('subjectRef')
//       .populate('classRef')
//       .lean();

//     return subjectChannels;
//   }

//   return [];
// }

// /**
//  * Build subjectTeacherMap: { subjectId(string) -> teacherRealName }
//  * Used by students so the sidebar can show the teacher under each subject.
//  * We need classRef._id, so we populate teacherAssignments.classRef on the query.
//  */
// async function buildSubjectTeacherMap(classRefId) {
//   const map = {};

//   // Find all teachers assigned to this class, with subjectRefs populated
//   const teachers = await User.find({
//     role: 'teacher',
//     'teacherAssignments.classRef': classRefId,
//   })
//     .select('realName teacherAssignments')
//     .populate({ path: 'teacherAssignments.subjectRefs', select: '_id' })
//     .lean();

//   for (const teacher of teachers) {
//     for (const assignment of teacher.teacherAssignments) {
//       // Only process assignments that belong to this student's class
//       const assignClassId = assignment.classRef?.toString() || String(assignment.classRef);
//       if (assignClassId !== classRefId.toString()) continue;

//       for (const sub of assignment.subjectRefs || []) {
//         const subId = sub._id?.toString() || sub.toString();
//         map[subId] = teacher.realName;
//       }
//     }
//   }

//   return map;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // POST /api/auth/register/send-otp
// // ─────────────────────────────────────────────────────────────────────────────
// router.post('/register/send-otp', async (req, res) => {
//   try {
//     const { rollNo, name, email, classId } = req.body;
//     if (!rollNo || !name || !email || !classId) {
//       return res.status(400).json({ error: 'rollNo, name, email and classId are required' });
//     }

//     // Block teacher/admin roll numbers from using student registration
//     const existing = await User.findOne({
//       $or: [{ rollNo: rollNo.toUpperCase() }, { email: email.toLowerCase() }],
//     });
//     if (existing) {
//       if (existing.role !== 'student') {
//         return res.status(403).json({ error: 'Teacher/admin accounts are managed by the administrator' });
//       }
//       if (existing.isVerified) {
//         return res.status(409).json({ error: 'Roll number or email is already registered' });
//       }
//       // Unverified student — allow resend
//     }

//     const cls = await Class.findOne({ classId });
//     if (!cls) return res.status(404).json({ error: 'Class not found' });

//     const otp       = genOTP();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
//     const aliasNum  = parseInt(rollNo.slice(-4)) % 9000 + 1000;

//     await User.findOneAndUpdate(
//       { rollNo: rollNo.toUpperCase() },
//       {
//         rollNo:     rollNo.toUpperCase(),
//         realName:   name,
//         email:      email.toLowerCase(),
//         password:   await bcrypt.hash(rollNo, 10),
//         role:       'student',
//         classRef:   cls._id,
//         anonAlias:  `Student#${aliasNum}`,
//         otp,
//         otpExpiry,
//         isVerified: false,
//       },
//       { upsert: true, new: true }
//     );

//     await sendOTP(email, otp, name);
//     res.json({ message: 'OTP sent to your email' });
//   } catch (err) {
//     console.error('send-otp error:', err);
//     res.status(500).json({ error: 'Failed to send OTP' });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // POST /api/auth/register/verify
// // ─────────────────────────────────────────────────────────────────────────────
// router.post('/register/verify', async (req, res) => {
//   try {
//     const { rollNo, otp, password } = req.body;
//     if (!rollNo || !otp || !password) {
//       return res.status(400).json({ error: 'rollNo, otp and password are required' });
//     }

//     const user = await User.findOne({ rollNo: rollNo.toUpperCase() }).populate('classRef');
//     if (!user)            return res.status(400).json({ error: 'No pending registration found' });
//     if (user.isVerified)  return res.status(400).json({ error: 'Already registered, please login' });
//     if (user.otp !== otp) return res.status(400).json({ error: 'Incorrect OTP' });
//     if (new Date() > user.otpExpiry) return res.status(400).json({ error: 'OTP expired, request a new one' });

//     user.password   = await bcrypt.hash(password, 10);
//     user.isVerified = true;
//     user.otp        = null;
//     user.otpExpiry  = null;
//     await user.save();

//     const token    = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     const channels = await buildChannels(user);
//     const subjectTeacherMap = user.classRef
//       ? await buildSubjectTeacherMap(user.classRef._id)
//       : {};

//     res.json({
//       token,
//       user: {
//         _id:       user._id,
//         rollNo:    user.rollNo,
//         realName:  user.realName,
//         email:     user.email,
//         role:      user.role,
//         anonAlias: user.anonAlias,
//         classRef:  user.classRef,
//         teacherAssignments: [],
//         skillTags: [],
//       },
//       channels,
//       subjectTeacherMap,
//     });
//   } catch (err) {
//     console.error('register/verify error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // POST /api/auth/login
// // ─────────────────────────────────────────────────────────────────────────────
// router.post('/login', async (req, res) => {
//   try {
//     const { rollNo, password } = req.body;
//     if (!rollNo || !password) {
//       return res.status(400).json({ error: 'Roll number and password required' });
//     }

//     // Fetch user with all nested refs populated so buildChannels works correctly
//     const user = await User.findOne({ rollNo: rollNo.toUpperCase() })
//       .populate('classRef')
//       .populate({
//         path:     'teacherAssignments.classRef',
//         model:    'Class',
//       })
//       .populate({
//         path:     'teacherAssignments.subjectRefs',
//         model:    'Subject',
//       });

//     if (!user) {
//       return res.status(401).json({ error: 'Invalid roll number or password' });
//     }

//     // Students must complete OTP verification; teachers/admin are pre-verified
//     if (user.role === 'student' && !user.isVerified) {
//       return res.status(401).json({
//         error: 'Account not verified. Please complete registration via OTP.',
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid roll number or password' });
//     }

//     const token    = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     const channels = await buildChannels(user);

//     // Build subjectTeacherMap only for students
//     let subjectTeacherMap = {};
//     if (user.role === 'student' && user.classRef) {
//       subjectTeacherMap = await buildSubjectTeacherMap(user.classRef._id);
//     }

//     res.json({
//       token,
//       user: {
//         _id:                user._id,
//         rollNo:             user.rollNo,
//         realName:           user.realName,
//         email:              user.email,
//         role:               user.role,
//         anonAlias:          user.anonAlias,
//         classRef:           user.classRef   || null,
//         teacherAssignments: user.teacherAssignments || [],
//         skillTags:          user.skillTags  || [],
//       },
//       channels,
//       subjectTeacherMap,
//     });
//   } catch (err) {
//     console.error('login error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/auth/me  — refresh current user + channels
// // ─────────────────────────────────────────────────────────────────────────────
// router.get('/me', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id)
//       .select('-password -otp -otpExpiry')
//       .populate('classRef')
//       .populate({ path: 'teacherAssignments.classRef',   model: 'Class'   })
//       .populate({ path: 'teacherAssignments.subjectRefs', model: 'Subject' });

//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const channels = await buildChannels(user);
//     let subjectTeacherMap = {};
//     if (user.role === 'student' && user.classRef) {
//       subjectTeacherMap = await buildSubjectTeacherMap(user.classRef._id);
//     }

//     res.json({ user, channels, subjectTeacherMap });
//   } catch (err) {
//     console.error('me error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/auth/classes  — public, used by register form dropdown
// // ─────────────────────────────────────────────────────────────────────────────
// router.get('/classes', async (req, res) => {
//   try {
//     const classes = await Class.find().sort({ classId: 1 }).lean();
//     res.json(classes);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // PATCH /api/auth/teacher/skills  — teacher updates own skill tags
// // ─────────────────────────────────────────────────────────────────────────────
// router.patch('/teacher/skills', auth, async (req, res) => {
//   try {
//     if (req.user.role !== 'teacher') {
//       return res.status(403).json({ error: 'Teachers only' });
//     }
//     const { skillTags } = req.body;
//     if (!Array.isArray(skillTags)) {
//       return res.status(400).json({ error: 'skillTags must be an array of strings' });
//     }
//     const clean = skillTags.map(s => String(s).trim()).filter(Boolean);
//     await User.findByIdAndUpdate(req.user._id, { skillTags: clean });
//     res.json({ success: true, skillTags: clean });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/auth/class/:classId/students
// // Teacher (assigned to class) or Admin can see real student names
// // ─────────────────────────────────────────────────────────────────────────────
// router.get('/class/:classId/students', auth, async (req, res) => {
//   try {
//     if (req.user.role === 'student') {
//       return res.status(403).json({ error: 'Forbidden' });
//     }

//     const cls = await Class.findOne({ classId: req.params.classId }).lean();
//     if (!cls) return res.status(404).json({ error: 'Class not found' });

//     // Teacher must be assigned to this class
//     if (req.user.role === 'teacher') {
//       const teacher  = await User.findById(req.user._id).lean();
//       const assigned = (teacher.teacherAssignments || []).some(
//         a => a.classRef.toString() === cls._id.toString()
//       );
//       if (!assigned) {
//         return res.status(403).json({ error: 'You are not assigned to this class' });
//       }
//     }

//     const students = await User.find({ role: 'student', classRef: cls._id })
//       .select('rollNo realName email anonAlias')
//       .sort({ rollNo: 1 })
//       .lean();

//     res.json(students);
//   } catch (err) {
//     console.error('class/students error:', err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;


// const express   = require('express');
// const router    = express.Router();
// const bcrypt    = require('bcryptjs');
// const jwt       = require('jsonwebtoken');
// const User      = require('../models/User');
// const Class     = require('../models/Class');
// const Subject   = require('../models/Subject');
// const Channel   = require('../models/Channel');
// const { sendOTP } = require('../config/mailer');
// const { notify }  = require('../config/notify');
// const { auth }    = require('../middleware/auth');

// function genOTP() { return String(Math.floor(100000 + Math.random() * 900000)); }

// // ── Build channels ────────────────────────────────────────────────────────
// async function buildChannels(user) {
//   if (user.role === 'admin') {
//     return Channel.find({ type: { $ne: 'dm' } }).populate('subjectRef').populate('classRef').lean();
//   }
//   if (user.role === 'student') {
//     const classId = user.classRef?._id || user.classRef;
//     const [globals, subjectChs] = await Promise.all([
//       Channel.find({ isGlobal: true }).lean(),
//       Channel.find({ type: 'subject', classRef: classId }).populate('subjectRef').populate('classRef').lean(),
//     ]);
//     return [...globals, ...subjectChs];
//   }
//   if (user.role === 'teacher') {
//     const assignments = user.teacherAssignments || [];
//     if (!assignments.length) return [];
//     const classIds   = assignments.map(a => a.classRef?._id || a.classRef);
//     const subjectIds = assignments.flatMap(a => (a.subjectRefs || []).map(s => s._id || s));
//     if (!subjectIds.length) return [];
//     return Channel.find({ type: 'subject', classRef: { $in: classIds }, subjectRef: { $in: subjectIds } })
//       .populate('subjectRef').populate('classRef').lean();
//   }
//   return [];
// }

// async function buildSubjectTeacherMap(classRefId) {
//   const map = {};
//   const teachers = await User.find({ role: 'teacher', 'teacherAssignments.classRef': classRefId })
//     .select('realName teacherAssignments')
//     .populate({ path: 'teacherAssignments.subjectRefs', select: '_id' })
//     .lean();
//   for (const t of teachers) {
//     for (const a of t.teacherAssignments) {
//       if (a.classRef?.toString() !== classRefId.toString()) continue;
//       for (const s of a.subjectRefs || []) {
//         map[(s._id || s).toString()] = t.realName;
//       }
//     }
//   }
//   return map;
// }

// // ── Student: send OTP ─────────────────────────────────────────────────────
// router.post('/register/send-otp', async (req, res) => {
//   try {
//     const { rollNo, name, email, classId } = req.body;
//     if (!rollNo || !name || !email || !classId)
//       return res.status(400).json({ error: 'rollNo, name, email and classId are required' });

//     const existing = await User.findOne({ $or: [{ rollNo: rollNo.toUpperCase() }, { email: email.toLowerCase() }] });
//     if (existing) {
//       if (existing.role !== 'student')
//         return res.status(403).json({ error: 'Teacher/admin accounts are managed by the administrator' });
//       if (existing.isVerified)
//         return res.status(409).json({ error: 'Roll number or email is already registered' });
//     }

//     const cls = await Class.findOne({ classId });
//     if (!cls) return res.status(404).json({ error: 'Class not found' });

//     const otp = genOTP();
//     await User.findOneAndUpdate(
//       { rollNo: rollNo.toUpperCase() },
//       {
//         rollNo: rollNo.toUpperCase(), realName: name, email: email.toLowerCase(),
//         password: await bcrypt.hash(rollNo, 10), role: 'student', classRef: cls._id,
//         anonAlias: `Student#${parseInt(rollNo.slice(-4)) % 9000 + 1000}`,
//         otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000), isVerified: false,
//       },
//       { upsert: true, new: true }
//     );
//     await sendOTP(email, otp, name);
//     res.json({ message: 'OTP sent to your email' });
//   } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to send OTP' }); }
// });

// // ── Student: verify OTP ───────────────────────────────────────────────────
// router.post('/register/verify', async (req, res) => {
//   try {
//     const { rollNo, otp, password } = req.body;
//     if (!rollNo || !otp || !password)
//       return res.status(400).json({ error: 'rollNo, otp and password are required' });

//     const user = await User.findOne({ rollNo: rollNo.toUpperCase() }).populate('classRef');
//     if (!user)           return res.status(400).json({ error: 'No pending registration found' });
//     if (user.isVerified) return res.status(400).json({ error: 'Already registered, please login' });
//     if (user.otp !== otp) return res.status(400).json({ error: 'Incorrect OTP' });
//     if (new Date() > user.otpExpiry) return res.status(400).json({ error: 'OTP expired' });

//     user.password = await bcrypt.hash(password, 10);
//     user.isVerified = true; user.otp = null; user.otpExpiry = null;
//     await user.save();

//     const token    = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     const channels = await buildChannels(user);
//     const stm      = user.classRef ? await buildSubjectTeacherMap(user.classRef._id) : {};
//     res.json({ token, user: { _id: user._id, rollNo: user.rollNo, realName: user.realName, email: user.email, role: user.role, anonAlias: user.anonAlias, classRef: user.classRef, teacherAssignments: [], skillTags: [] }, channels, subjectTeacherMap: stm });
//   } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
// });

// // ── Teacher: send OTP (Step 1 of teacher registration) ───────────────────
// router.post('/teacher/register/send-otp', async (req, res) => {
//   try {
//     const { employeeId, name, email, department, skillTags } = req.body;
//     if (!employeeId || !name || !email)
//       return res.status(400).json({ error: 'employeeId, name and email are required' });

//     const existing = await User.findOne({ $or: [{ rollNo: employeeId.toUpperCase() }, { email: email.toLowerCase() }] });
//     if (existing && existing.isVerified)
//       return res.status(409).json({ error: 'Employee ID or email already registered' });

//     const otp = genOTP();
//     await User.findOneAndUpdate(
//       { rollNo: employeeId.toUpperCase() },
//       {
//         rollNo: employeeId.toUpperCase(), realName: name, email: email.toLowerCase(),
//         password: await bcrypt.hash(employeeId, 10), role: 'teacher',
//         anonAlias: 'Teacher', skillTags: skillTags || [],
//         otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
//         isVerified: false, isPendingApproval: false,
//       },
//       { upsert: true, new: true }
//     );
//     await sendOTP(email, otp, name);
//     res.json({ message: 'OTP sent to your email' });
//   } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to send OTP' }); }
// });

// // ── Teacher: verify OTP → pending approval ────────────────────────────────
// router.post('/teacher/register/verify', async (req, res) => {
//   try {
//     const { employeeId, otp, password } = req.body;
//     if (!employeeId || !otp || !password)
//       return res.status(400).json({ error: 'employeeId, otp and password are required' });

//     const user = await User.findOne({ rollNo: employeeId.toUpperCase() });
//     if (!user)           return res.status(400).json({ error: 'No pending registration found' });
//     if (user.isVerified) return res.status(400).json({ error: 'Already registered' });
//     if (user.otp !== otp) return res.status(400).json({ error: 'Incorrect OTP' });
//     if (new Date() > user.otpExpiry) return res.status(400).json({ error: 'OTP expired' });

//     user.password = await bcrypt.hash(password, 10);
//     user.isVerified     = true;
//     user.isPendingApproval = true; // awaits admin approval
//     user.otp = null; user.otpExpiry = null;
//     await user.save();

//     // Notify admin
//     const admin = await User.findOne({ role: 'admin' });
//     if (admin) {
//       await notify({
//         recipientId: admin._id,
//         type: 'teacher_approved',
//         title: 'New teacher registration',
//         body: `${user.realName} (${user.rollNo}) has registered and is awaiting approval.`,
//         meta: { teacherId: user._id },
//       });
//     }

//     res.json({ message: 'Registration complete. Awaiting admin approval before you can log in.' });
//   } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
// });

// // ── Login ─────────────────────────────────────────────────────────────────
// router.post('/login', async (req, res) => {
//   try {
//     const { rollNo, password } = req.body;
//     if (!rollNo || !password) return res.status(400).json({ error: 'Roll number and password required' });

//     const user = await User.findOne({ rollNo: rollNo.toUpperCase() })
//       .populate('classRef')
//       .populate({ path: 'teacherAssignments.classRef', model: 'Class' })
//       .populate({ path: 'teacherAssignments.subjectRefs', model: 'Subject' });

//     if (!user) return res.status(401).json({ error: 'Invalid roll number or password' });
//     if (user.role === 'student' && !user.isVerified)
//       return res.status(401).json({ error: 'Account not verified. Please complete registration.' });
//     if (user.role === 'teacher' && !user.isVerified)
//       return res.status(401).json({ error: 'Account not verified. Please complete registration.' });
//     if (user.role === 'teacher' && user.isPendingApproval)
//       return res.status(403).json({ error: 'Your account is pending admin approval. Please wait.' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ error: 'Invalid roll number or password' });

//     const token    = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     const channels = await buildChannels(user);
//     let stm = {};
//     if (user.role === 'student' && user.classRef)
//       stm = await buildSubjectTeacherMap(user.classRef._id);

//     res.json({
//       token,
//       user: { _id: user._id, rollNo: user.rollNo, realName: user.realName, email: user.email, role: user.role, anonAlias: user.anonAlias, classRef: user.classRef || null, teacherAssignments: user.teacherAssignments || [], skillTags: user.skillTags || [] },
//       channels,
//       subjectTeacherMap: stm,
//     });
//   } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
// });

// // ── GET /auth/me ──────────────────────────────────────────────────────────
// router.get('/me', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).select('-password -otp -otpExpiry')
//       .populate('classRef')
//       .populate({ path: 'teacherAssignments.classRef', model: 'Class' })
//       .populate({ path: 'teacherAssignments.subjectRefs', model: 'Subject' });
//     if (!user) return res.status(404).json({ error: 'User not found' });
//     const channels = await buildChannels(user);
//     let stm = {};
//     if (user.role === 'student' && user.classRef)
//       stm = await buildSubjectTeacherMap(user.classRef._id);
//     res.json({ user, channels, subjectTeacherMap: stm });
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // ── GET /auth/classes — public ─────────────────────────────────────────────
// router.get('/classes', async (req, res) => {
//   try { res.json(await Class.find().sort({ classId: 1 }).lean()); }
//   catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // ── PATCH /auth/teacher/skills ─────────────────────────────────────────────
// router.patch('/teacher/skills', auth, async (req, res) => {
//   try {
//     if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
//     const clean = (req.body.skillTags || []).map(s => String(s).trim()).filter(Boolean);
//     await User.findByIdAndUpdate(req.user._id, { skillTags: clean });
//     res.json({ success: true, skillTags: clean });
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // ── GET /auth/class/:classId/students ─────────────────────────────────────
// router.get('/class/:classId/students', auth, async (req, res) => {
//   try {
//     if (req.user.role === 'student') return res.status(403).json({ error: 'Forbidden' });
//     const cls = await Class.findOne({ classId: req.params.classId }).lean();
//     if (!cls) return res.status(404).json({ error: 'Class not found' });
//     if (req.user.role === 'teacher') {
//       const teacher  = await User.findById(req.user._id).lean();
//       const assigned = (teacher.teacherAssignments || []).some(a => a.classRef.toString() === cls._id.toString());
//       if (!assigned) return res.status(403).json({ error: 'Not assigned to this class' });
//     }
//     const students = await User.find({ role: 'student', classRef: cls._id })
//       .select('rollNo realName email anonAlias').sort({ rollNo: 1 }).lean();
//     res.json(students);
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // ── GET /auth/teachers — for DM: student picks a teacher ─────────────────
// router.get('/teachers', auth, async (req, res) => {
//   try {
//     if (req.user.role !== 'student') return res.status(403).json({ error: 'Students only' });
//     // Return teachers assigned to the student's class
//     const student = await User.findById(req.user._id).lean();
//     const teachers = await User.find({
//       role: 'teacher',
//       'teacherAssignments.classRef': student.classRef,
//     }).select('rollNo realName email skillTags').lean();
//     res.json(teachers);
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// module.exports = router;


const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const User      = require('../models/User');
const Class     = require('../models/Class');
const Subject   = require('../models/Subject');
const Channel   = require('../models/Channel');
const { sendOTP } = require('../config/mailer');
const { notify }  = require('../config/notify');
const { auth }    = require('../middleware/auth');

function genOTP() { return String(Math.floor(100000 + Math.random() * 900000)); }

// ── Auto-generate teacher ID: TCH + year + 3-digit sequence ──────────────
async function generateTeacherId() {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `TCH${year}`;
  const existing = await User.find({ rollNo: { $regex: `^${prefix}` }, role: 'teacher' })
    .select('rollNo').lean();
  const nums = existing.map(u => parseInt(u.rollNo.replace(prefix, '')) || 0);
  const next  = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

// ── Build channels ─────────────────────────────────────────────────────────
async function buildChannels(user) {
  if (user.role === 'admin') {
    return Channel.find({ type: { $ne: 'dm' } }).populate('subjectRef').populate('classRef').lean();
  }
  if (user.role === 'student') {
    const classId = user.classRef?._id || user.classRef;
    const [globals, subjectChs] = await Promise.all([
      Channel.find({ isGlobal: true }).lean(),
      Channel.find({ type: 'subject', classRef: classId }).populate('subjectRef').populate('classRef').lean(),
    ]);
    return [...globals, ...subjectChs];
  }
  if (user.role === 'teacher') {
    const assignments = user.teacherAssignments || [];
    if (!assignments.length) return [];
    const classIds   = assignments.map(a => a.classRef?._id || a.classRef);
    const subjectIds = assignments.flatMap(a => (a.subjectRefs || []).map(s => s._id || s));
    if (!subjectIds.length) return [];
    return Channel.find({
      type: 'subject', classRef: { $in: classIds }, subjectRef: { $in: subjectIds },
    }).populate('subjectRef').populate('classRef').lean();
  }
  return [];
}

async function buildSubjectTeacherMap(classRefId) {
  const map = {};
  const teachers = await User.find({ role: 'teacher', 'teacherAssignments.classRef': classRefId })
    .select('realName teacherAssignments')
    .populate({ path: 'teacherAssignments.subjectRefs', select: '_id' })
    .lean();
  for (const t of teachers) {
    for (const a of t.teacherAssignments) {
      if (a.classRef?.toString() !== classRefId.toString()) continue;
      for (const s of a.subjectRefs || []) {
        map[(s._id || s).toString()] = t.realName;
      }
    }
  }
  return map;
}

// ── Student: send OTP ──────────────────────────────────────────────────────
router.post('/register/send-otp', async (req, res) => {
  try {
    const { rollNo, name, email, classId } = req.body;
    if (!rollNo || !name || !email || !classId)
      return res.status(400).json({ error: 'rollNo, name, email and classId are required' });

    const existing = await User.findOne({ $or: [{ rollNo: rollNo.toUpperCase() }, { email: email.toLowerCase() }] });
    if (existing) {
      if (existing.role !== 'student')
        return res.status(403).json({ error: 'Teacher/admin accounts are managed by the administrator' });
      if (existing.isVerified)
        return res.status(409).json({ error: 'Roll number or email is already registered' });
    }

    const cls = await Class.findOne({ classId });
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const otp = genOTP();
    await User.findOneAndUpdate(
      { rollNo: rollNo.toUpperCase() },
      {
        rollNo: rollNo.toUpperCase(), realName: name, email: email.toLowerCase(),
        password: await bcrypt.hash(rollNo, 10), role: 'student', classRef: cls._id,
        anonAlias: `Student#${parseInt(rollNo.slice(-4)) % 9000 + 1000}`,
        otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000), isVerified: false,
      },
      { upsert: true, new: true }
    );
    await sendOTP(email, otp, name);
    res.json({ message: 'OTP sent to your email' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to send OTP' }); }
});

// ── Student: verify OTP ────────────────────────────────────────────────────
router.post('/register/verify', async (req, res) => {
  try {
    const { rollNo, otp, password } = req.body;
    if (!rollNo || !otp || !password)
      return res.status(400).json({ error: 'rollNo, otp and password are required' });

    const user = await User.findOne({ rollNo: rollNo.toUpperCase() }).populate('classRef');
    if (!user)           return res.status(400).json({ error: 'No pending registration found' });
    if (user.isVerified) return res.status(400).json({ error: 'Already registered, please login' });
    if (user.otp !== otp) return res.status(400).json({ error: 'Incorrect OTP' });
    if (new Date() > user.otpExpiry) return res.status(400).json({ error: 'OTP expired' });

    user.password = await bcrypt.hash(password, 10);
    user.isVerified = true; user.otp = null; user.otpExpiry = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const channels = await buildChannels(user);
    const stm = user.classRef ? await buildSubjectTeacherMap(user.classRef._id) : {};
    res.json({
      token,
      user: { _id: user._id, rollNo: user.rollNo, realName: user.realName, email: user.email, role: user.role, anonAlias: user.anonAlias, classRef: user.classRef, teacherAssignments: [], skillTags: [] },
      channels, subjectTeacherMap: stm,
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Teacher: send OTP  (no manual ID — auto-generated on verify) ───────────
router.post('/teacher/register/send-otp', async (req, res) => {
  try {
    const { name, email, department, skillTags } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: 'Name and email are required' });

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing && existing.isVerified)
      return res.status(409).json({ error: 'Email already registered' });

    const otp = genOTP();
    // Use email as a temporary lookup key before ID is assigned
    await User.findOneAndUpdate(
      { email: email.toLowerCase(), role: 'teacher', isVerified: false },
      {
        // rollNo will be assigned on verify; set placeholder so unique constraint doesn't block
        rollNo: `PENDING_${Date.now()}`,
        realName: name,
        email: email.toLowerCase(),
        password: await bcrypt.hash(email, 10),
        role: 'teacher',
        anonAlias: 'Teacher',
        skillTags: Array.isArray(skillTags) ? skillTags : [],
        otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
        isVerified: false, isPendingApproval: false,
      },
      { upsert: true, new: true }
    );
    await sendOTP(email, otp, name);
    res.json({ message: 'OTP sent to your email' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to send OTP' }); }
});

// ── Teacher: verify OTP → assign auto ID → pending approval ───────────────
router.post('/teacher/register/verify', async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password)
      return res.status(400).json({ error: 'email, otp and password are required' });

    const user = await User.findOne({ email: email.toLowerCase(), role: 'teacher', isVerified: false });
    if (!user)  return res.status(400).json({ error: 'No pending registration found for this email' });
    if (user.otp !== otp)  return res.status(400).json({ error: 'Incorrect OTP' });
    if (new Date() > user.otpExpiry) return res.status(400).json({ error: 'OTP expired. Request a new OTP.' });

    // Auto-assign teacher ID
    const teacherId = await generateTeacherId();

    user.rollNo        = teacherId;
    user.password      = await bcrypt.hash(password, 10);
    user.isVerified    = true;
    user.isPendingApproval = true; // login blocked until admin approves
    user.otp = null; user.otpExpiry = null;
    await user.save();

    // Notify admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      await notify({
        recipientId: admin._id, type: 'teacher_approved',
        title: 'New teacher registration',
        body: `${user.realName} (${teacherId}) registered and awaits approval.`,
        meta: { teacherId: user._id },
      });
    }

    res.json({
      message: 'Registration complete! Your Teacher ID is:',
      teacherId,
      note: 'Your account is pending admin approval. You will receive an email notification once approved.',
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Login ──────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { rollNo, password } = req.body;
    if (!rollNo || !password) return res.status(400).json({ error: 'Roll number and password required' });

    const user = await User.findOne({ rollNo: rollNo.toUpperCase() })
      .populate('classRef')
      .populate({ path: 'teacherAssignments.classRef', model: 'Class' })
      .populate({ path: 'teacherAssignments.subjectRefs', model: 'Subject' });

    if (!user) return res.status(401).json({ error: 'Invalid roll number or password' });
    if (user.role === 'student' && !user.isVerified)
      return res.status(401).json({ error: 'Account not verified. Please complete registration.' });
    if (user.role === 'teacher' && !user.isVerified)
      return res.status(401).json({ error: 'Account not verified. Please complete registration.' });
    if (user.role === 'teacher' && user.isPendingApproval)
      return res.status(403).json({ error: 'Your account is pending admin approval. You will be notified by email once approved.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid roll number or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const channels = await buildChannels(user);
    let stm = {};
    if (user.role === 'student' && user.classRef)
      stm = await buildSubjectTeacherMap(user.classRef._id);

    res.json({
      token,
      user: { _id: user._id, rollNo: user.rollNo, realName: user.realName, email: user.email, role: user.role, anonAlias: user.anonAlias, classRef: user.classRef || null, teacherAssignments: user.teacherAssignments || [], skillTags: user.skillTags || [] },
      channels, subjectTeacherMap: stm,
    });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── GET /auth/me ───────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpiry')
      .populate('classRef')
      .populate({ path: 'teacherAssignments.classRef', model: 'Class' })
      .populate({ path: 'teacherAssignments.subjectRefs', model: 'Subject' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const channels = await buildChannels(user);
    let stm = {};
    if (user.role === 'student' && user.classRef)
      stm = await buildSubjectTeacherMap(user.classRef._id);
    res.json({ user, channels, subjectTeacherMap: stm });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ── GET /auth/classes ──────────────────────────────────────────────────────
router.get('/classes', async (req, res) => {
  try { res.json(await Class.find().sort({ classId: 1 }).lean()); }
  catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ── PATCH /auth/teacher/skills ─────────────────────────────────────────────
router.patch('/teacher/skills', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
    const clean = (req.body.skillTags || []).map(s => String(s).trim()).filter(Boolean);
    await User.findByIdAndUpdate(req.user._id, { skillTags: clean });
    res.json({ success: true, skillTags: clean });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ── GET /auth/class/:classId/students ──────────────────────────────────────
router.get('/class/:classId/students', auth, async (req, res) => {
  try {
    if (req.user.role === 'student') return res.status(403).json({ error: 'Forbidden' });
    const cls = await Class.findOne({ classId: req.params.classId }).lean();
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    if (req.user.role === 'teacher') {
      const teacher = await User.findById(req.user._id).lean();
      const assigned = (teacher.teacherAssignments || []).some(a => a.classRef.toString() === cls._id.toString());
      if (!assigned) return res.status(403).json({ error: 'Not assigned to this class' });
    }
    const students = await User.find({ role: 'student', classRef: cls._id })
      .select('rollNo realName email anonAlias').sort({ rollNo: 1 }).lean();
    res.json(students);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ── GET /auth/teachers — student picks a teacher for DM ───────────────────
router.get('/teachers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Students only' });
    const student = await User.findById(req.user._id).lean();
    const teachers = await User.find({ role: 'teacher', 'teacherAssignments.classRef': student.classRef })
      .select('rollNo realName email skillTags').lean();
    res.json(teachers);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;