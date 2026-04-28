const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  type:        { type: String, enum: ['general', 'feedback', 'complaints', 'subject', 'dm'], required: true },
  isGlobal:    { type: Boolean, default: false },
  studentOnly: { type: Boolean, default: false }, // general/feedback/complaints = true; teachers excluded
  subjectRef:  { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
  classRef:    { type: mongoose.Schema.Types.ObjectId, ref: 'Class',   default: null },
  description: { type: String, default: '' },
  // DM channels only
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Channel', channelSchema);