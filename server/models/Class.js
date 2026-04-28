const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  classId:     { type: String, required: true, unique: true }, // e.g. "G-19"
  course:      { type: String, required: true },               // e.g. "CSE"
  semester:    { type: Number, required: true },
  year:        { type: Number, required: true },
  section:     { type: String, required: true },               // e.g. "G-19"
  displayName: { type: String, required: true },               // e.g. "CSE-24 Sem-4 G-19"
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);