// const express = require('express');
// const router = express.Router();
// const Poll = require('../models/Poll');
// const { auth, requireRole } = require('../middleware/auth');

// // GET /api/polls/:channelId
// router.get('/:channelId', auth, async (req, res) => {
//   try {
//     const polls = await Poll.find({ channelRef: req.params.channelId }).sort({ createdAt: -1 });
//     const sanitized = polls.map(p => {
//       const obj = p.toObject();
//       // Auto-close if past closesAt
//       if (obj.closesAt && new Date() > new Date(obj.closesAt)) obj.isClosed = true;
//       obj.options = obj.options.map(o => ({
//         ...o,
//         voteCount: o.votes.length,
//         userVoted: o.votes.some(id => id.toString() === req.user._id.toString()),
//         votes: undefined,
//       }));
//       return obj;
//     });
//     res.json(sanitized);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // POST /api/polls/:channelId — teacher/admin only
// router.post('/:channelId', auth, requireRole('teacher', 'admin'), async (req, res) => {
//   try {
//     const { question, options, closesAt } = req.body;
//     if (!question || !options?.length) return res.status(400).json({ error: 'Question and options required' });

//     const poll = await Poll.create({
//       channelRef: req.params.channelId,
//       createdBy: req.user._id,
//       question,
//       options: options.map(text => ({ text, votes: [] })),
//       closesAt: closesAt ? new Date(closesAt) : undefined,
//     });
//     res.status(201).json(poll);
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // POST /api/polls/:pollId/vote
// router.post('/:pollId/vote', auth, async (req, res) => {
//   try {
//     const { optionIndex } = req.body;
//     const poll = await Poll.findById(req.params.pollId);
//     if (!poll) return res.status(404).json({ error: 'Poll not found' });
//     if (poll.isClosed || (poll.closesAt && new Date() > poll.closesAt)) {
//       return res.status(400).json({ error: 'Poll is closed' });
//     }

//     // Remove previous vote
//     poll.options.forEach(o => {
//       o.votes = o.votes.filter(id => id.toString() !== req.user._id.toString());
//     });

//     if (optionIndex >= 0 && optionIndex < poll.options.length) {
//       poll.options[optionIndex].votes.push(req.user._id);
//     }

//     await poll.save();
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;






const express = require('express');
const router  = express.Router();
const Poll    = require('../models/Poll');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/polls/:channelId
router.get('/:channelId', auth, async (req, res) => {
  try {
    const polls = await Poll.find({ channelRef: req.params.channelId }).sort({ createdAt: -1 });
    const sanitized = polls.map(p => {
      const obj = p.toObject();
      if (obj.closesAt && new Date() > new Date(obj.closesAt)) obj.isClosed = true;
      const totalVotes = obj.options.reduce((s, o) => s + o.votes.length, 0);
      obj.options = obj.options.map(o => ({
        ...o,
        voteCount:  o.votes.length,
        userVoted:  o.votes.some(id => id.toString() === req.user._id.toString()),
        percentage: totalVotes > 0 ? Math.round((o.votes.length / totalVotes) * 100) : 0,
        votes:      undefined, // strip raw voter ids
      }));
      obj.totalVotes = totalVotes;
      return obj;
    });
    res.json(sanitized);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/polls/:channelId/stats — teacher analytics (raw vote counts per poll)
router.get('/:channelId/stats', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const polls = await Poll.find({ channelRef: req.params.channelId }).sort({ createdAt: -1 });
    const stats = polls.map(p => {
      const total = p.options.reduce((s, o) => s + o.votes.length, 0);
      return {
        _id:      p._id,
        question: p.question,
        isClosed: p.isClosed || (p.closesAt && new Date() > p.closesAt),
        closesAt: p.closesAt,
        createdAt:p.createdAt,
        totalVotes: total,
        options: p.options.map(o => ({
          text:       o.text,
          voteCount:  o.votes.length,
          percentage: total > 0 ? Math.round((o.votes.length / total) * 100) : 0,
        })),
      };
    });
    res.json(stats);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/polls/:channelId
router.post('/:channelId', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { question, options, closesAt } = req.body;
    if (!question || !options?.length) return res.status(400).json({ error: 'Question and options required' });
    const poll = await Poll.create({
      channelRef: req.params.channelId,
      createdBy:  req.user._id,
      question,
      options: options.map(text => ({ text, votes: [] })),
      closesAt: closesAt ? new Date(closesAt) : undefined,
    });
    res.status(201).json(poll);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// PATCH /api/polls/:pollId/close
router.patch('/:pollId/close', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(req.params.pollId, { isClosed: true }, { new: true });
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    res.json(poll);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// POST /api/polls/:pollId/vote
router.post('/:pollId/vote', auth, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    if (poll.isClosed || (poll.closesAt && new Date() > poll.closesAt)) {
      return res.status(400).json({ error: 'Poll is closed' });
    }
    poll.options.forEach(o => { o.votes = o.votes.filter(id => id.toString() !== req.user._id.toString()); });
    if (optionIndex >= 0 && optionIndex < poll.options.length) {
      poll.options[optionIndex].votes.push(req.user._id);
    }
    await poll.save();
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;