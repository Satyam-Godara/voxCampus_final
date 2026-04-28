// const mongoose = require('mongoose');

// // Each teacher assignment: one class + the subjects they teach in that class
// const teacherAssignmentSchema = new mongoose.Schema({
//   classRef:    { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
//   subjectRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
// }, { _id: false });

// const userSchema = new mongoose.Schema({
//   rollNo:     { type: String, required: true, unique: true, uppercase: true },
//   realName:   { type: String, required: true },
//   email:      { type: String, required: true, unique: true },
//   password:   { type: String, required: true },
//   role:       { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
//   anonAlias:  { type: String, default: '' },

//   // ── Student only ──────────────────────────────────────────────────────
//   classRef:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },

//   // ── Teacher only ──────────────────────────────────────────────────────
//   // teacherAssignments[i] = { classRef: ObjectId, subjectRefs: [ObjectId] }
//   // A teacher can have multiple class assignments, each with its own subject list
//   teacherAssignments: { type: [teacherAssignmentSchema], default: [] },
//   skillTags:          { type: [String], default: [] },

//   // ── Registration / OTP ───────────────────────────────────────────────
//   otp:        { type: String,  default: null },
//   otpExpiry:  { type: Date,    default: null },
//   isVerified: { type: Boolean, default: false },
//   isActive:   { type: Boolean, default: true  },
// }, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);



const mongoose = require('mongoose');

const teacherAssignmentSchema = new mongoose.Schema({
  classRef:    { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subjectRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
}, { _id: false });

const userSchema = new mongoose.Schema({
  rollNo:     { type: String, required: true, unique: true, uppercase: true },
  realName:   { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  anonAlias:  { type: String, default: '' },

  // Student
  classRef:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class', default: null },

  // Teacher
  teacherAssignments: { type: [teacherAssignmentSchema], default: [] },
  skillTags:          { type: [String], default: [] },
  // teacher registration: pending = registered but awaiting admin approval
  isPendingApproval:  { type: Boolean, default: false },

  // OTP
  otp:        { type: String,  default: null },
  otpExpiry:  { type: Date,    default: null },
  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);