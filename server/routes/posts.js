// const express = require('express');
// const router = express.Router();
// const Post = require('../models/Post');
// const { auth } = require('../middleware/auth');

// const sanitizePost = (post, userId, isAdmin) => {
//   const obj = post.toObject ? post.toObject() : post;
//   if (!isAdmin) {
//     delete obj.authorRef;
//     obj.comments = (obj.comments || [])
//       .filter(c => !c.deletedAt)
//       .map(c => { const cc = { ...c }; delete cc.authorRef; return cc; });
//   }
//   obj.userVote = obj.upvotes?.some(id => id.toString() === userId.toString()) ? 'up'
//     : obj.downvotes?.some(id => id.toString() === userId.toString()) ? 'down' : null;
//   obj.upvoteCount = obj.upvotes?.length || 0;
//   obj.downvoteCount = obj.downvotes?.length || 0;
//   delete obj.upvotes;
//   delete obj.downvotes;
//   return obj;
// };

// // GET /api/posts/:channelId
// router.get('/:channelId', auth, async (req, res) => {
//   try {
//     const { sort = 'votes', page = 1, limit = 20 } = req.query;
//     const sortObj = sort === 'votes' ? { voteScore: -1, createdAt: -1 } : { createdAt: -1 };

//     const posts = await Post.find({ channelRef: req.params.channelId, deletedAt: null })
//       .sort(sortObj)
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     res.json(posts.map(p => sanitizePost(p, req.user._id, req.user.role === 'admin')));
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // POST /api/posts/:channelId
// router.post('/:channelId', auth, async (req, res) => {
//   try {
//     const { content, imageUrl } = req.body;
//     if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

//     const post = await Post.create({
//       channelRef: req.params.channelId,
//       authorRef: req.user._id,
//       anonAlias: req.user.anonAlias,
//       content: content.trim(),
//       imageUrl,
//     });

//     res.status(201).json(sanitizePost(post, req.user._id, req.user.role === 'admin'));
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // POST /api/posts/:postId/vote
// router.post('/:postId/vote', auth, async (req, res) => {
//   try {
//     const { vote } = req.body; // 'up', 'down', or null (remove)
//     const post = await Post.findById(req.params.postId);
//     if (!post) return res.status(404).json({ error: 'Post not found' });

//     // Remove existing vote
//     post.upvotes = post.upvotes.filter(id => id.toString() !== req.user._id.toString());
//     post.downvotes = post.downvotes.filter(id => id.toString() !== req.user._id.toString());

//     if (vote === 'up') post.upvotes.push(req.user._id);
//     if (vote === 'down') post.downvotes.push(req.user._id);

//     await post.save();
//     res.json(sanitizePost(post, req.user._id, req.user.role === 'admin'));
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // POST /api/posts/:postId/comment
// router.post('/:postId/comment', auth, async (req, res) => {
//   try {
//     const { content } = req.body;
//     if (!content?.trim()) return res.status(400).json({ error: 'Comment content required' });

//     const post = await Post.findById(req.params.postId);
//     if (!post || post.deletedAt) return res.status(404).json({ error: 'Post not found' });

//     post.comments.push({
//       authorRef: req.user._id,
//       anonAlias: req.user.anonAlias,
//       content: content.trim(),
//     });
//     await post.save();
//     res.json(sanitizePost(post, req.user._id, req.user.role === 'admin'));
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // DELETE /api/posts/:postId — soft delete by author or admin
// router.delete('/:postId', auth, async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.postId);
//     if (!post) return res.status(404).json({ error: 'Post not found' });

//     const isOwner = post.authorRef.toString() === req.user._id.toString();
//     if (!isOwner && req.user.role !== 'admin') {
//       return res.status(403).json({ error: 'Not authorized' });
//     }

//     post.deletedAt = new Date();
//     await post.save();
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;



const express = require('express');
const router  = express.Router();
const Post    = require('../models/Post');
const { auth } = require('../middleware/auth');
const { notify } = require('../config/notify');

const sanitizePost = (post, userId, isAdmin) => {
  const obj = post.toObject ? post.toObject() : { ...post };
  if (!isAdmin) {
    delete obj.authorRef;
    obj.comments = (obj.comments || [])
      .filter(c => !c.deletedAt)
      .map(c => { const cc = { ...c }; delete cc.authorRef; return cc; });
  }
  obj.userVote    = obj.upvotes?.some(id => id.toString() === userId?.toString()) ? 'up'
    : obj.downvotes?.some(id => id.toString() === userId?.toString()) ? 'down' : null;
  obj.upvoteCount   = obj.upvotes?.length   || 0;
  obj.downvoteCount = obj.downvotes?.length || 0;
  delete obj.upvotes;
  delete obj.downvotes;
  return obj;
};

// GET /api/posts/:channelId
router.get('/:channelId', auth, async (req, res) => {
  try {
    const { sort = 'votes', page = 1, limit = 20 } = req.query;
    const sortObj = sort === 'votes' ? { voteScore: -1, createdAt: -1 } : { createdAt: -1 };
    const posts = await Post.find({ channelRef: req.params.channelId, deletedAt: null })
      .sort(sortObj).skip((page - 1) * parseInt(limit)).limit(parseInt(limit));
    res.json(posts.map(p => sanitizePost(p, req.user._id, req.user.role === 'admin')));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/posts/:channelId  — supports imageUrl from /api/upload/post-image
router.post('/:channelId', auth, async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    if (!content?.trim() && !imageUrl) return res.status(400).json({ error: 'Content or image required' });

    const post = await Post.create({
      channelRef: req.params.channelId,
      authorRef:  req.user._id,
      anonAlias:  req.user.anonAlias,
      content:    content?.trim() || '',
      imageUrl:   imageUrl || null,
    });
    res.status(201).json(sanitizePost(post, req.user._id, req.user.role === 'admin'));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/posts/:postId/vote
router.post('/:postId/vote', auth, async (req, res) => {
  try {
    const { vote } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post || post.deletedAt) return res.status(404).json({ error: 'Post not found' });

    post.upvotes   = post.upvotes.filter(id => id.toString() !== req.user._id.toString());
    post.downvotes = post.downvotes.filter(id => id.toString() !== req.user._id.toString());
    if (vote === 'up')   post.upvotes.push(req.user._id);
    if (vote === 'down') post.downvotes.push(req.user._id);
    await post.save();

    // Notify post author when upvoted (not self-vote)
    if (vote === 'up' && post.authorRef.toString() !== req.user._id.toString()) {
      await notify({ recipientId: post.authorRef, type: 'post_vote', title: 'Your post was upvoted', body: post.content.slice(0, 80), link: post.channelRef.toString() });
    }

    res.json(sanitizePost(post, req.user._id, req.user.role === 'admin'));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/posts/:postId/comment
router.post('/:postId/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Comment required' });
    const post = await Post.findById(req.params.postId);
    if (!post || post.deletedAt) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({ authorRef: req.user._id, anonAlias: req.user.anonAlias, content: content.trim() });
    await post.save();

    // Notify post author of new comment (not self-comment)
    if (post.authorRef.toString() !== req.user._id.toString()) {
      await notify({ recipientId: post.authorRef, type: 'post_comment', title: 'New comment on your post', body: content.slice(0, 80), link: post.channelRef.toString() });
    }

    res.json(sanitizePost(post, req.user._id, req.user.role === 'admin'));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// DELETE /api/posts/:postId
router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const isOwner = post.authorRef.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized' });
    post.deletedAt = new Date();
    await post.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;