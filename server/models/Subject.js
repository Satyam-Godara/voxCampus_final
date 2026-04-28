const mongoose = require('mongoose');

// Each Subject belongs to exactly ONE class.
// Same subject code taught to different classes = separate Subject documents.
const subjectSchema = new mongoose.Schema({
  code:     { type: String, required: true }, // e.g. "CSE2301"
  name:     { type: String, required: true }, // e.g. "Linux Administration"
  classRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);