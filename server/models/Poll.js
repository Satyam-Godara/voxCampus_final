const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  channelRef:   { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question:     { type: String, required: true },
  options:      [{ text: String, votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] }],
  isAnonymous:  { type: Boolean, default: true },
  closesAt:     { type: Date },
  isClosed:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Poll', pollSchema);