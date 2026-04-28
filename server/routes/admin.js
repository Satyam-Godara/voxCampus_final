// const express  = require('express');
// const router   = express.Router();
// const User     = require('../models/User');
// const Class    = require('../models/Class');
// const Subject  = require('../models/Subject');
// const Channel  = require('../models/Channel');
// const { auth, requireRole } = require('../middleware/auth');

// const adminOnly = [auth, requireRole('admin')];

// // GET /api/admin/stats
// router.get('/stats', ...adminOnly, async (req, res) => {
//   try {
//     const [students, teachers, classes, subjects] = await Promise.all([
//       User.countDocuments({ role: 'student' }),
//       User.countDocuments({ role: 'teacher' }),
//       Class.countDocuments(),
//       Subject.countDocuments(),
//     ]);
//     res.json({ students, teachers, classes, subjects });
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // GET /api/admin/students
// router.get('/students', ...adminOnly, async (req, res) => {
//   try {
//     const students = await User.find({ role: 'student' })
//       .select('-password -otp -otpExpiry')
//       .populate('classRef')
//       .sort({ rollNo: 1 });
//     res.json(students);
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // PUT /api/admin/students/:id
// router.put('/students/:id', ...adminOnly, async (req, res) => {
//   try {
//     const { classId, realName, email } = req.body;
//     const updates = {};
//     if (realName) updates.realName = realName;
//     if (email)    updates.email    = email;
//     if (classId) {
//       const cls = await Class.findOne({ classId });
//       if (!cls) return res.status(404).json({ error: 'Class not found' });
//       updates.classRef = cls._id;
//     }
//     const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
//       .select('-password').populate('classRef');
//     res.json(user);
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // DELETE /api/admin/students/:id
// router.delete('/students/:id', ...adminOnly, async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // GET /api/admin/teachers
// router.get('/teachers', ...adminOnly, async (req, res) => {
//   try {
//     const teachers = await User.find({ role: 'teacher' })
//       .select('-password -otp -otpExpiry')
//       .populate({ path: 'teacherAssignments.classRef' })
//       .populate({ path: 'teacherAssignments.subjectRefs' });
//     res.json(teachers);
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // GET /api/admin/classes
// router.get('/classes', ...adminOnly, async (req, res) => {
//   try {
//     const classes = await Class.find().sort({ classId: 1 });
//     res.json(classes);
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // GET /api/admin/classes/:classId/subjects
// router.get('/classes/:classId/subjects', ...adminOnly, async (req, res) => {
//   try {
//     const cls = await Class.findOne({ classId: req.params.classId });
//     if (!cls) return res.status(404).json({ error: 'Class not found' });
//     const subjects = await Subject.find({ classRef: cls._id }).sort({ code: 1 });
//     res.json(subjects);
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // PUT /api/admin/teachers/:id/assignments
// // Body: { assignments: [{classId, subjectCodes[]}] }
// // Replaces the teacher's full teacherAssignments array
// router.put('/teachers/:id/assignments', ...adminOnly, async (req, res) => {
//   try {
//     const { assignments } = req.body; // [{classId, subjectCodes:[]}]
//     if (!Array.isArray(assignments)) return res.status(400).json({ error: 'assignments must be array' });

//     const built = [];
//     for (const a of assignments) {
//       const cls = await Class.findOne({ classId: a.classId });
//       if (!cls) continue;
//       const subjects = await Subject.find({ classRef: cls._id, code: { $in: a.subjectCodes } });
//       built.push({ classRef: cls._id, subjectRefs: subjects.map(s => s._id) });
//     }

//     const teacher = await User.findByIdAndUpdate(
//       req.params.id,
//       { teacherAssignments: built },
//       { new: true }
//     ).populate({ path: 'teacherAssignments.classRef' })
//      .populate({ path: 'teacherAssignments.subjectRefs' });

//     res.json(teacher);
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // PUT /api/admin/teachers/:id — edit teacher name/email
// router.put('/teachers/:id', ...adminOnly, async (req, res) => {
//   try {
//     const { realName, email, skillTags } = req.body;
//     const updates = {};
//     if (realName)  updates.realName  = realName;
//     if (email)     updates.email     = email;
//     if (skillTags) updates.skillTags = skillTags;
//     const teacher = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
//     res.json(teacher);
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// // DELETE /api/admin/teachers/:id
// router.delete('/teachers/:id', ...adminOnly, async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.params.id);
//     res.json({ success: true });
//   } catch (err) { res.status(500).json({ error: 'Server error' }); }
// });

// module.exports = router;

const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const Class    = require('../models/Class');
const Subject  = require('../models/Subject');
const { auth, requireRole } = require('../middleware/auth');
const { notify } = require('../config/notify');
const {sendAcceptanceMail} = require('../config/mailer');

const adminOnly = [auth, requireRole('admin')];

router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const [students, teachers, pending, classes, subjects] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher', isPendingApproval: false }),
      User.countDocuments({ role: 'teacher', isPendingApproval: true }),
      Class.countDocuments(), Subject.countDocuments(),
    ]);
    res.json({ students, teachers, pending, classes, subjects });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/students', ...adminOnly, async (req, res) => {
  try {
    res.json(await User.find({ role: 'student' }).select('-password -otp -otpExpiry').populate('classRef').sort({ rollNo: 1 }));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/students/:id', ...adminOnly, async (req, res) => {
  try {
    const { classId, realName, email } = req.body;
    const updates = {};
    if (realName) updates.realName = realName;
    if (email) updates.email = email;
    if (classId) {
      const cls = await Class.findOne({ classId });
      if (!cls) return res.status(404).json({ error: 'Class not found' });
      updates.classRef = cls._id;
    }
    res.json(await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password').populate('classRef'));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/students/:id', ...adminOnly, async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/teachers', ...adminOnly, async (req, res) => {
  try {
    res.json(await User.find({ role: 'teacher', isPendingApproval: false })
      .select('-password -otp -otpExpiry')
      .populate({ path: 'teacherAssignments.classRef' })
      .populate({ path: 'teacherAssignments.subjectRefs' }));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Pending teacher approvals
router.get('/teachers/pending', ...adminOnly, async (req, res) => {
  try {
    res.json(await User.find({ role: 'teacher', isPendingApproval: true, isVerified: true })
      .select('-password -otp -otpExpiry').sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.patch('/teachers/:id/approve', ...adminOnly, async (req, res) => {
  try {
    const teacher = await User.findByIdAndUpdate(req.params.id, { isPendingApproval: false }, { new: true });
    if (!teacher) return res.status(404).json({ error: 'Not found' });
    await notify({ recipientId: teacher._id, type: 'teacher_approved', title: 'Account approved!', body: 'Your VoxCampus account is active. You can now log in.' });
    const email = teacher.email;
    const name = teacher.realName;
    const rollNo = teacher.rollNo;
    await sendAcceptanceMail(email,rollNo, name);
    res.json({ success: true, teacher });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/teachers/:id/reject', ...adminOnly, async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/classes', ...adminOnly, async (req, res) => {
  try { res.json(await Class.find().sort({ classId: 1 })); }
  catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/classes/:classId/subjects', ...adminOnly, async (req, res) => {
  try {
    const cls = await Class.findOne({ classId: req.params.classId });
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(await Subject.find({ classRef: cls._id }).sort({ code: 1 }));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/teachers/:id/assignments', ...adminOnly, async (req, res) => {
  try {
    const { assignments } = req.body;
    if (!Array.isArray(assignments)) return res.status(400).json({ error: 'assignments must be array' });
    const built = [];
    for (const a of assignments) {
      const cls = await Class.findOne({ classId: a.classId });
      if (!cls) continue;
      const subjects = await Subject.find({ classRef: cls._id, code: { $in: a.subjectCodes } });
      built.push({ classRef: cls._id, subjectRefs: subjects.map(s => s._id) });
    }
    const teacher = await User.findByIdAndUpdate(req.params.id, { teacherAssignments: built }, { new: true })
      .populate({ path: 'teacherAssignments.classRef' })
      .populate({ path: 'teacherAssignments.subjectRefs' });
    res.json(teacher);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.put('/teachers/:id', ...adminOnly, async (req, res) => {
  try {
    const { realName, email, skillTags } = req.body;
    const u = {};
    if (realName) u.realName = realName;
    if (email) u.email = email;
    if (skillTags) u.skillTags = skillTags;
    res.json(await User.findByIdAndUpdate(req.params.id, u, { new: true }).select('-password'));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

router.delete('/teachers/:id', ...adminOnly, async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;