const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'new_message',       // someone messaged in a channel you're in
      'new_post',          // new post in General/Feedback/Complaints
      'post_comment',      // someone commented on your post
      'post_vote',         // your post got upvoted
      'announcement',      // teacher posted announcement
      'dm_request',        // student wants to DM you (teacher)
      'dm_accepted',       // teacher accepted your DM (student)
      'dm_message',        // new DM message
      'teacher_approved',  // admin approved teacher registration
    ],
    required: true,
  },
  title:    { type: String, required: true },
  body:     { type: String, default: '' },
  link:     { type: String, default: null }, // channel _id or route hint
  isRead:   { type: Boolean, default: false },
  // Metadata for rendering
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

notificationSchema.index({ recipientRef: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);