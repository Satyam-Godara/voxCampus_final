const mongoose = require('mongoose');

// A DM thread between exactly one student and one teacher.
// Student initiates; teacher accepts or declines.
const dmSchema = new mongoose.Schema({
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacher:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:    { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  channelRef:{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel', default: null },
  // Student stays anonymous unless they reveal
  studentRevealed: { type: Boolean, default: false },
}, { timestamps: true });

// One DM thread per student-teacher pair
dmSchema.index({ student: 1, teacher: 1 }, { unique: true });

module.exports = mongoose.model('DM', dmSchema);