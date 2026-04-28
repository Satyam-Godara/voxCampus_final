// const express = require('express');
// const router = express.Router();
// const Message = require('../models/Message');
// const Channel = require('../models/Channel');
// const { auth } = require('../middleware/auth');

// // GET /api/messages/:channelId  — paginated history
// router.get('/:channelId', auth, async (req, res) => {
//   try {
//     const { page = 1, limit = 50 } = req.query;
//     const messages = await Message.find({
//       channelRef: req.params.channelId,
//       deletedAt: null,
//     })
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     // For non-admin, never expose authorRef
//     const sanitized = messages.map(m => {
//       const obj = m.toObject();
//       if (req.user.role !== 'admin') delete obj.authorRef;
//       return obj;
//     });

//     res.json(sanitized.reverse());
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // POST /api/messages/:channelId  — send message (REST fallback; primary path is Socket.IO)
// router.post('/:channelId', auth, async (req, res) => {
//   try {
//     const { content, type, announcementMeta } = req.body;
//     if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

//     // Teachers can post announcements, others post chat
//     const msgType = (req.user.role === 'teacher' || req.user.role === 'admin') && type === 'announcement'
//       ? 'announcement' : 'chat';

//     const msg = await Message.create({
//       channelRef: req.params.channelId,
//       authorRef: req.user._id,
//       anonAlias: req.user.anonAlias,
//       content: content.trim(),
//       type: msgType,
//       announcementMeta: msgType === 'announcement' ? announcementMeta : undefined,
//     });

//     const obj = msg.toObject();
//     if (req.user.role !== 'admin') delete obj.authorRef;
//     res.status(201).json(obj);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // DELETE /api/messages/:messageId — soft delete (own message or admin)
// router.delete('/:messageId', auth, async (req, res) => {
//   try {
//     const msg = await Message.findById(req.params.messageId);
//     if (!msg) return res.status(404).json({ error: 'Message not found' });

//     const isOwner = msg.authorRef.toString() === req.user._id.toString();
//     if (!isOwner && req.user.role !== 'admin') {
//       return res.status(403).json({ error: 'Not authorized' });
//     }

//     msg.deletedAt = new Date();
//     msg.deletedBy = req.user._id;
//     await msg.save();
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;
const express = require('express');
const router  = express.Router();
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const { auth } = require('../middleware/auth');

// GET /api/messages/:channelId
router.get('/:channelId', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const messages = await Message.find({ channelRef: req.params.channelId, deletedAt: null })
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));
    const sanitized = messages.map(m => {
      const obj = m.toObject();
      if (req.user.role !== 'admin') delete obj.authorRef;
      return obj;
    });
    res.json(sanitized.reverse());
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/messages/:channelId  (REST fallback; primary path is Socket.IO)
router.post('/:channelId', auth, async (req, res) => {
  try {
    const { content, type, announcementMeta, fileUrl, fileName, fileType } = req.body;
    if (!content?.trim() && !fileUrl) return res.status(400).json({ error: 'Content or file required' });

    const isTeacherOrAdmin = req.user.role === 'teacher' || req.user.role === 'admin';
    const msgType = isTeacherOrAdmin && type === 'announcement' ? 'announcement'
      : fileUrl ? 'file' : 'chat';

    const msg = await Message.create({
      channelRef:  req.params.channelId,
      authorRef:   req.user._id,
      anonAlias:   req.user.role === 'teacher' ? req.user.realName : req.user.anonAlias,
      content:     content?.trim() || '',
      type:        msgType,
      fileUrl:     fileUrl || null,
      fileName:    fileName || null,
      fileType:    fileType || null,
      announcementMeta: msgType === 'announcement' ? announcementMeta : undefined,
    });

    const obj = msg.toObject();
    if (req.user.role !== 'admin') delete obj.authorRef;
    res.status(201).json(obj);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/messages/:messageId
router.delete('/:messageId', auth, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.messageId);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    const isOwner = msg.authorRef?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
    msg.deletedAt = new Date();
    msg.deletedBy = req.user._id;
    await msg.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;