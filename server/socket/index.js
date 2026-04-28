// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const Message = require('../models/Message');
// const Channel = require('../models/Channel');

// module.exports = (io) => {
//   // Auth middleware for socket
//   io.use(async (socket, next) => {
//     try {
//       const token = socket.handshake.auth.token;
//       if (!token) return next(new Error('No token'));
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.id).select('-password');
//       if (!user) return next(new Error('User not found'));
//       socket.user = user;
//       next();
//     } catch {
//       next(new Error('Auth failed'));
//     }
//   });

//   io.on('connection', (socket) => {
//     console.log(`Socket connected: ${socket.user.rollNo} (${socket.user.role})`);

//     // Join a channel room
//     socket.on('join_channel', (channelId) => {
//       socket.join(`channel:${channelId}`);
//     });

//     // Leave a channel room
//     socket.on('leave_channel', (channelId) => {
//       socket.leave(`channel:${channelId}`);
//     });

//     // Send a chat message
//     socket.on('send_message', async ({ channelId, content, type, announcementMeta }) => {
//       try {
//         if (!content?.trim()) return;

//         const channel = await Channel.findById(channelId);
//         if (!channel) return;
        
//         const msgType =
//           (socket.user.role === 'teacher' || socket.user.role === 'admin') && type === 'announcement'
//             ? 'announcement'
//             : 'chat';

//         const msg = await Message.create({
//           channelRef: channelId,
//           authorRef: socket.user._id,
//           anonAlias: socket.user.anonAlias,
//           content: content.trim(),
//           type: msgType,
//           announcementMeta: msgType === 'announcement' ? announcementMeta : undefined,
//         });

//         const payload = msg.toObject();
//         // Emit full payload to admin, sanitized to others
//         io.to(`channel:${channelId}`).emit('new_message', {
//           ...payload,
//           authorRef: undefined, // stripped for all; admin fetches via REST if needed
//         });
//       } catch (err) {
//         socket.emit('error', { message: 'Failed to send message' });
//       }
//     });

//     // Delete a message
//     socket.on('delete_message', async ({ messageId }) => {
//       try {
//         const msg = await Message.findById(messageId);
//         if (!msg) return;
//         const isOwner = msg.authorRef.toString() === socket.user._id.toString();
//         if (!isOwner && socket.user.role !== 'admin') return;
//         msg.deletedAt = new Date();
//         await msg.save();
//         io.to(`channel:${msg.channelRef.toString()}`).emit('message_deleted', { messageId });
//       } catch {}
//     });

//     // Typing indicator
//     socket.on('typing', ({ channelId }) => {
//       socket.to(`channel:${channelId}`).emit('user_typing', {
//         alias: socket.user.anonAlias,
//         channelId,
//       });
//     });

//     socket.on('disconnect', () => {
//       console.log(`Socket disconnected: ${socket.user.rollNo}`);
//     });
//   });
// };







// const jwt     = require('jsonwebtoken');
// const User    = require('../models/User');
// const Message = require('../models/Message');
// const Channel = require('../models/Channel');
// const DM      = require('../models/DM');
// const { notify } = require('../config/notify');

// module.exports = (io) => {
//   // Auth handshake
//   io.use(async (socket, next) => {
//     try {
//       const token = socket.handshake.auth.token;
//       if (!token) return next(new Error('No token'));
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.id).select('-password');
//       if (!user) return next(new Error('User not found'));
//       socket.user = user;
//       next();
//     } catch { next(new Error('Auth failed')); }
//   });

//   io.on('connection', (socket) => {
//     console.log(`[WS] connected: ${socket.user.rollNo} (${socket.user.role})`);

//     // Each user joins their own private room for targeted notifications/DMs
//     socket.join(`user:${socket.user._id}`);

//     // ── Channel rooms ─────────────────────────────────────────────────
//     socket.on('join_channel', (channelId) => socket.join(`channel:${channelId}`));
//     socket.on('leave_channel', (channelId) => socket.leave(`channel:${channelId}`));

//     // ── Send chat message ─────────────────────────────────────────────
//     socket.on('send_message', async ({ channelId, content, type, announcementMeta, fileUrl, fileName, fileType }) => {
//       try {
//         if (!content?.trim() && !fileUrl) return;

//         const channel = await Channel.findById(channelId);
//         if (!channel) return;

//         const isTeacherOrAdmin = socket.user.role === 'teacher' || socket.user.role === 'admin';
//         const msgType = isTeacherOrAdmin && type === 'announcement' ? 'announcement'
//           : fileUrl ? 'file'
//           : 'chat';

//         const msg = await Message.create({
//           channelRef: channelId,
//           authorRef:  socket.user._id,
//           anonAlias:  socket.user.role === 'teacher' ? socket.user.realName : socket.user.anonAlias,
//           content:    content?.trim() || '',
//           type:       msgType,
//           fileUrl:    fileUrl || null,
//           fileName:   fileName || null,
//           fileType:   fileType || null,
//           announcementMeta: msgType === 'announcement' ? announcementMeta : undefined,
//         });

//         const payload = { ...msg.toObject(), authorRef: undefined };
//         io.to(`channel:${channelId}`).emit('new_message', payload);

//         // Notify other users in channel (non-DM channels only — DM has its own flow)
//         if (channel.type !== 'dm' && msgType !== 'chat') {
//           // For announcements: notify all channel members (students in the class)
//           // We push to the channel room's socket user IDs
//           // Lightweight approach: emit a notification event to the channel room
//           socket.to(`channel:${channelId}`).emit('notification', {
//             type:  'announcement',
//             title: `New announcement in ${channel.name}`,
//             body:  content?.slice(0, 80) || '',
//             link:  channelId,
//           });
//         }

//         // DM message notification
//         if (channel.type === 'dm') {
//           const dm = await DM.findOne({ channelRef: channelId });
//           if (dm) {
//             const otherId = socket.user._id.toString() === dm.student.toString()
//               ? dm.teacher : dm.student;
//             await notify({
//               recipientId: otherId, type: 'dm_message',
//               title: 'New private message',
//               body:  content?.slice(0, 80) || (fileName ? `Shared a file: ${fileName}` : ''),
//               link:  channelId,
//             });
//           }
//         }
//       } catch (err) { socket.emit('error', { message: 'Failed to send message' }); }
//     });

//     // ── Delete message ────────────────────────────────────────────────
//     socket.on('delete_message', async ({ messageId }) => {
//       try {
//         const msg = await Message.findById(messageId);
//         if (!msg) return;
//         const isOwner = msg.authorRef.toString() === socket.user._id.toString();
//         if (!isOwner && socket.user.role !== 'admin') return;
//         msg.deletedAt = new Date();
//         await msg.save();
//         io.to(`channel:${msg.channelRef.toString()}`).emit('message_deleted', { messageId });
//       } catch {}
//     });

//     // ── Typing indicator ──────────────────────────────────────────────
//     socket.on('typing', ({ channelId }) => {
//       socket.to(`channel:${channelId}`).emit('user_typing', {
//         alias: socket.user.role === 'teacher' ? socket.user.realName : socket.user.anonAlias,
//         channelId,
//       });
//     });

//     // ── Mark notifications read ───────────────────────────────────────
//     socket.on('mark_notifs_read', async () => {
//       const Notification = require('../models/Notification');
//       await Notification.updateMany({ recipientRef: socket.user._id, isRead: false }, { isRead: true });
//     });

//     socket.on('disconnect', () => {
//       console.log(`[WS] disconnected: ${socket.user.rollNo}`);
//     });
//   });
// };








const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const Message = require('../models/Message');
const Channel = require('../models/Channel');
const DM      = require('../models/DM');
const { notify } = require('../config/notify');

// Track active screen-share sessions: channelId → { teacherSocketId, teacherName }
const activeShares = {};

module.exports = (io) => {

  // ── Auth middleware ────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch { next(new Error('Auth failed')); }
  });

  io.on('connection', (socket) => {
    console.log(`[WS] connected: ${socket.user.rollNo} (${socket.user.role})`);
    socket.join(`user:${socket.user._id}`);

    // ── Channel rooms ──────────────────────────────────────────────────
    socket.on('join_channel', (channelId) => {
      socket.join(`channel:${channelId}`);
      // Tell joining student if a screen share is active in this channel
      if (activeShares[channelId]) {
        socket.emit('screenshare_active', {
          channelId,
          teacherName: activeShares[channelId].teacherName,
        });
      }
    });

    socket.on('leave_channel', (channelId) => socket.leave(`channel:${channelId}`));

    // ── Chat messages ──────────────────────────────────────────────────
    socket.on('send_message', async ({ channelId, content, type, announcementMeta, fileUrl, fileName, fileType }) => {
      try {
        if (!content?.trim() && !fileUrl) return;
        const channel = await Channel.findById(channelId);
        if (!channel) return;

        const isTeacherOrAdmin = socket.user.role === 'teacher' || socket.user.role === 'admin';
        const msgType = isTeacherOrAdmin && type === 'announcement' ? 'announcement'
          : fileUrl ? 'file' : 'chat';

        const msg = await Message.create({
          channelRef:  channelId,
          authorRef:   socket.user._id,
          anonAlias:   socket.user.role === 'teacher' ? socket.user.realName : socket.user.anonAlias,
          content:     content?.trim() || '',
          type:        msgType,
          fileUrl:     fileUrl || null,
          fileName:    fileName || null,
          fileType:    fileType || null,
          announcementMeta: msgType === 'announcement' ? announcementMeta : undefined,
        });

        io.to(`channel:${channelId}`).emit('new_message', { ...msg.toObject(), authorRef: undefined });

        if (channel.type !== 'dm' && msgType === 'announcement') {
          socket.to(`channel:${channelId}`).emit('notification', {
            type: 'announcement',
            title: `New announcement in ${channel.name}`,
            body: content?.slice(0, 80) || '',
            link: channelId,
          });
        }

        if (channel.type === 'dm') {
          const dm = await DM.findOne({ channelRef: channelId });
          if (dm) {
            const otherId = socket.user._id.toString() === dm.student.toString() ? dm.teacher : dm.student;
            await notify({
              recipientId: otherId, type: 'dm_message',
              title: 'New private message',
              body: content?.slice(0, 80) || (fileName ? `Shared a file: ${fileName}` : ''),
              link: channelId,
            });
          }
        }
      } catch (err) { socket.emit('error', { message: 'Failed to send message' }); }
    });

    // ── Delete message ─────────────────────────────────────────────────
    socket.on('delete_message', async ({ messageId }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        const isOwner = msg.authorRef.toString() === socket.user._id.toString();
        if (!isOwner && socket.user.role !== 'admin') return;
        msg.deletedAt = new Date();
        await msg.save();
        io.to(`channel:${msg.channelRef.toString()}`).emit('message_deleted', { messageId });
      } catch {}
    });

    // ── Typing indicator ───────────────────────────────────────────────
    socket.on('typing', ({ channelId }) => {
      socket.to(`channel:${channelId}`).emit('user_typing', {
        alias: socket.user.role === 'teacher' ? socket.user.realName : socket.user.anonAlias,
        channelId,
      });
    });

    // ════════════════════════════════════════════════════════════════════
    // SCREEN SHARE — WebRTC signaling
    // Flow:
    //   Teacher starts → screenshare_start → all students notified
    //   Student joins  → screenshare_join  → teacher sends WebRTC offer to that student
    //   Student gets offer, sends answer   → screenshare_answer → forwarded to teacher
    //   ICE candidates exchanged bidirectionally
    //   Teacher stops  → screenshare_end   → all students close their viewer
    // ════════════════════════════════════════════════════════════════════

    // Teacher: start broadcasting screen
    socket.on('screenshare_start', ({ channelId }) => {
      if (socket.user.role !== 'teacher' && socket.user.role !== 'admin') return;
      activeShares[channelId] = { teacherSocketId: socket.id, teacherName: socket.user.realName };
      // Notify all students in the channel
      socket.to(`channel:${channelId}`).emit('screenshare_active', {
        channelId,
        teacherName: socket.user.realName,
      });
      console.log(`[Screen] ${socket.user.realName} started sharing in ${channelId}`);
    });

    // Student: wants to watch — asks teacher for a WebRTC offer
    socket.on('screenshare_join', ({ channelId }) => {
      const share = activeShares[channelId];
      if (!share) return socket.emit('screenshare_ended', { channelId });
      // Tell teacher to send an offer to this specific student
      io.to(share.teacherSocketId).emit('screenshare_request_offer', {
        channelId,
        viewerSocketId: socket.id,
        viewerAlias: socket.user.anonAlias || socket.user.realName,
      });
    });

    // Teacher → Student: WebRTC offer (sent to one specific viewer)
    socket.on('screenshare_offer', ({ channelId, viewerSocketId, sdp }) => {
      io.to(viewerSocketId).emit('screenshare_offer', {
        channelId,
        sdp,
        teacherSocketId: socket.id,
      });
    });

    // Student → Teacher: WebRTC answer
    socket.on('screenshare_answer', ({ channelId, teacherSocketId, sdp }) => {
      io.to(teacherSocketId).emit('screenshare_answer', {
        channelId,
        viewerSocketId: socket.id,
        sdp,
      });
    });

    // ICE candidate exchange (bidirectional)
    socket.on('screenshare_ice', ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit('screenshare_ice', {
        senderSocketId: socket.id,
        candidate,
      });
    });

    // Teacher: stop sharing
    socket.on('screenshare_end', ({ channelId }) => {
      if (activeShares[channelId]?.teacherSocketId === socket.id) {
        delete activeShares[channelId];
        io.to(`channel:${channelId}`).emit('screenshare_ended', { channelId });
        console.log(`[Screen] ${socket.user.realName} stopped sharing in ${channelId}`);
      }
    });

    // ── Notifications ──────────────────────────────────────────────────
    socket.on('mark_notifs_read', async () => {
      const Notification = require('../models/Notification');
      await Notification.updateMany({ recipientRef: socket.user._id, isRead: false }, { isRead: true });
    });

    // ── Disconnect cleanup ─────────────────────────────────────────────
    socket.on('disconnect', () => {
      // If a teacher disconnects while sharing, end all their active shares
      for (const [channelId, share] of Object.entries(activeShares)) {
        if (share.teacherSocketId === socket.id) {
          delete activeShares[channelId];
          io.to(`channel:${channelId}`).emit('screenshare_ended', { channelId });
        }
      }
      console.log(`[WS] disconnected: ${socket.user.rollNo}`);
    });
  });
};