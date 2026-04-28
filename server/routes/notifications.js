const express      = require('express');
const router       = express.Router();
const Notification = require('../models/Notification');
const { auth }     = require('../middleware/auth');

// GET /api/notifications — get latest 50 for current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientRef: req.user._id })
      .sort({ createdAt: -1 }).limit(50).lean();
    const unreadCount = await Notification.countDocuments({ recipientRef: req.user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipientRef: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, recipientRef: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;