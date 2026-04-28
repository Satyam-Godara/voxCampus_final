// const mongoose = require('mongoose');

// const messageSchema = new mongoose.Schema({
//   channelRef:  { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
//   authorRef:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // hidden from non-admin
//   anonAlias:   { type: String, required: true },
//   content:     { type: String, required: true },
//   type:        { type: String, enum: ['chat', 'announcement', 'system'], default: 'chat' },
//   // For announcements
//   announcementMeta: {
//     category:  { type: String, enum: ['assignment', 'deadline', 'exam', 'general'] },
//     dueDate:   { type: Date },
//   },
//   deletedAt:   { type: Date, default: null },
//   deletedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
// }, { timestamps: true });

// module.exports = mongoose.model('Message', messageSchema);


const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  channelRef:  { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  authorRef:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  anonAlias:   { type: String, required: true },
  content:     { type: String, default: '' },
  type:        { type: String, enum: ['chat', 'announcement', 'file', 'system'], default: 'chat' },
  // File attachment (teacher uploads in subject channels)
  fileUrl:     { type: String, default: null },
  fileName:    { type: String, default: null },
  fileType:    { type: String, default: null }, // 'image' | 'pdf' | 'doc' | 'other'
  // Announcement metadata
  announcementMeta: {
    category: { type: String, enum: ['assignment', 'deadline', 'exam', 'general'] },
    dueDate:  { type: Date },
  },
  deletedAt:  { type: Date, default: null },
  deletedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);