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
    await sendOTP(email, otp, name);
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
