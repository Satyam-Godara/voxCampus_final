// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// const connectDB = require('./config/db');

// const authRoutes    = require('./routes/auth');
// const messageRoutes = require('./routes/messages');
// const postRoutes    = require('./routes/posts');
// const pollRoutes    = require('./routes/polls');
// const adminRoutes   = require('./routes/admin');
// const socketHandler = require('./socket');

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL || 'http://localhost:5173',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

// // Middleware
// app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
// app.use(express.json());

// // Routes
// app.use('/api/auth',     authRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/posts',    postRoutes);
// app.use('/api/polls',    pollRoutes);
// app.use('/api/admin',    adminRoutes);

// app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// // Socket.IO
// socketHandler(io);

// // Connect DB then start server
// const PORT = process.env.PORT || 5000;
// connectDB().then(() => {
//   server.listen(PORT, () => console.log(`VoxCampus server running on port ${PORT}`));
// });



require('dotenv').config();
const express = require('express');
const http    = require('http');
const path    = require('path');
const { Server } = require('socket.io');
const cors    = require('cors');
const connectDB    = require('./config/db');
const notifyHelper = require('./config/notify');

const authRoutes    = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const postRoutes    = require('./routes/posts');
const pollRoutes    = require('./routes/polls');
const adminRoutes   = require('./routes/admin');
const dmRoutes      = require('./routes/dm');
const notifRoutes   = require('./routes/notifications');
const uploadRoutes  = require('./routes/upload');
const socketHandler = require('./socket');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:  process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Init notification helper with socket instance
notifyHelper.init(io);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',          authRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/posts',         postRoutes);
app.use('/api/polls',         pollRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/dm',            dmRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/upload',        uploadRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

socketHandler(io);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`VoxCampus server running on :${PORT}`));
});