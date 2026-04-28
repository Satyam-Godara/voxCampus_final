const express = require('express');
const router  = express.Router();
const DM      = require('../models/DM');
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const User    = require('../models/User');
const { auth } = require('../middleware/auth');
const { notify } = require('../config/notify');

// ── POST /api/dm/request  — student requests DM with a teacher ───────────
router.post('/request', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Students only' });
    const { teacherId } = req.body;
    if (!teacherId) return res.status(400).json({ error: 'teacherId required' });

    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const existing = await DM.findOne({ student: req.user._id, teacher: teacherId });
    if (existing) {
      if (existing.status === 'accepted') return res.json({ dm: existing, alreadyExists: true });
      if (existing.status === 'pending')  return res.json({ dm: existing, message: 'Request already sent' });
      // declined — allow re-request
      existing.status = 'pending';
      await existing.save();
      await notify({ recipientId: teacherId, type: 'dm_request', title: 'New private chat request', body: `A student wants to chat with you privately.`, meta: { dmId: existing._id } });
      return res.json({ dm: existing });
    }

    const dm = await DM.create({ student: req.user._id, teacher: teacherId });
    await notify({ recipientId: teacherId, type: 'dm_request', title: 'New private chat request', body: `A student wants to chat with you privately.`, meta: { dmId: dm._id } });
    res.status(201).json({ dm });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── GET /api/dm  — get all DMs for the current user ──────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'student'
      ? { student: req.user._id }
      : { teacher: req.user._id };

    const dms = await DM.find(query)
      .populate('student', 'rollNo anonAlias realName')
      .populate('teacher', 'rollNo realName')
      .populate('channelRef')
      .sort({ updatedAt: -1 });

    // For student: teacher name shown; for teacher: show student alias (anonymous)
    const sanitized = dms.map(dm => {
      const obj = dm.toObject();
      if (req.user.role === 'teacher' && !obj.studentRevealed) {
        // hide student real name/rollno from teacher unless student revealed
        obj.student = { _id: obj.student._id, anonAlias: obj.student.anonAlias };
      }
      return obj;
    });

    res.json(sanitized);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ── PATCH /api/dm/:id/respond — teacher accepts or declines ──────────────
router.patch('/:id/respond', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
    const { action } = req.body; // 'accept' | 'decline'
    if (!['accept', 'decline'].includes(action)) return res.status(400).json({ error: 'action must be accept or decline' });

    const dm = await DM.findOne({ _id: req.params.id, teacher: req.user._id });
    if (!dm) return res.status(404).json({ error: 'DM request not found' });

    if (action === 'decline') {
      dm.status = 'declined';
      await dm.save();
      await notify({ recipientId: dm.student, type: 'dm_accepted', title: 'Chat request declined', body: `${req.user.realName} declined your chat request.` });
      return res.json({ dm });
    }

    // Accept: create a private DM channel if one doesn't exist
    if (!dm.channelRef) {
      const ch = await Channel.create({
        name:         `DM · ${req.user.realName}`,
        type:         'dm',
        isGlobal:     false,
        studentOnly:  false,
        participants: [dm.student, dm.teacher],
        description:  'Private chat',
      });
      dm.channelRef = ch._id;
    }
    dm.status = 'accepted';
    await dm.save();

    await notify({ recipientId: dm.student, type: 'dm_accepted', title: 'Chat request accepted', body: `${req.user.realName} accepted your chat request. You can now message them.`, link: dm.channelRef.toString() });

    const populated = await dm.populate(['channelRef', 'student', 'teacher']);
    res.json({ dm: populated });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── PATCH /api/dm/:id/reveal — student reveals their identity ────────────
router.patch('/:id/reveal', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Students only' });
    const dm = await DM.findOne({ _id: req.params.id, student: req.user._id });
    if (!dm) return res.status(404).json({ error: 'DM not found' });
    dm.studentRevealed = true;
    await dm.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ── GET /api/dm/:id/messages ──────────────────────────────────────────────
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const dm = await DM.findById(req.params.id);
    if (!dm) return res.status(404).json({ error: 'DM not found' });
    if (dm.status !== 'accepted') return res.status(403).json({ error: 'DM not active' });

    const isParticipant = dm.student.toString() === req.user._id.toString()
      || dm.teacher.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ error: 'Forbidden' });

    const messages = await Message.find({ channelRef: dm.channelRef, deletedAt: null })
      .sort({ createdAt: -1 }).limit(100);
    res.json(messages.reverse());
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;