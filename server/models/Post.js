// const mongoose = require('mongoose');

// const commentSchema = new mongoose.Schema({
//   authorRef:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   anonAlias:  { type: String, required: true },
//   content:    { type: String, required: true },
//   deletedAt:  { type: Date, default: null },
// }, { timestamps: true });

// const postSchema = new mongoose.Schema({
//   channelRef:  { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
//   authorRef:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   anonAlias:   { type: String, required: true },
//   content:     { type: String, required: true },
//   imageUrl:    { type: String },
//   upvotes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   downvotes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//   voteScore:   { type: Number, default: 0 },
//   comments:    [commentSchema],
//   deletedAt:   { type: Date, default: null },
// }, { timestamps: true });

// // Keep voteScore in sync
// postSchema.pre('save', function(next) {
//   this.voteScore = this.upvotes.length - this.downvotes.length;
//   next();
// });

// module.exports = mongoose.model('Post', postSchema);


const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  authorRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  anonAlias: { type: String, required: true },
  content:   { type: String, required: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  channelRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true },
  authorRef:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  anonAlias:  { type: String, required: true },
  content:    { type: String, default: '' },
  imageUrl:   { type: String, default: null }, // student can attach one image
  upvotes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  voteScore:  { type: Number, default: 0 },
  comments:   [commentSchema],
  deletedAt:  { type: Date, default: null },
}, { timestamps: true });

postSchema.pre('save', function (next) {
  this.voteScore = this.upvotes.length - this.downvotes.length;
  next();
});

module.exports = mongoose.model('Post', postSchema);