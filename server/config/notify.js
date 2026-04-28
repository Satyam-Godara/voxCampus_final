const Notification = require('../models/Notification');

let _io = null;

const init = (io) => { _io = io; };

/**
 * Create a notification and push it to the recipient via Socket.IO.
 * @param {Object} opts
 * @param {string}  opts.recipientId  - User _id string
 * @param {string}  opts.type
 * @param {string}  opts.title
 * @param {string}  [opts.body]
 * @param {string}  [opts.link]       - channelId or route hint for client navigation
 * @param {Object}  [opts.meta]
 */
const notify = async ({ recipientId, type, title, body = '', link = null, meta = {} }) => {
  try {
    const n = await Notification.create({ recipientRef: recipientId, type, title, body, link, meta });
    if (_io) {
      _io.to(`user:${recipientId}`).emit('notification', n.toObject());
    }
    return n;
  } catch (err) {
    console.error('notify error:', err.message);
  }
};

module.exports = { init, notify };