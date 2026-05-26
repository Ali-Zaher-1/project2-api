// index.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./database');

const logger = require('./middleware/logger');
const { generalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Store online users
let onlineUsers = new Map(); // socketId -> { username, room }

// ========== DATABASE FUNCTIONS ==========
function saveMessage(from, to, message, room = 'general') {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO messages (from_user, to_user, message, room) VALUES (?, ?, ?, ?)`,
      [from, to, message, room],
      function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      }
    );
  });
}

function getMessages(room = 'general', limit = 100) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM messages WHERE room = ? ORDER BY timestamp ASC LIMIT ?`,
      [room, limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
}

function saveUser(username, email, name) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT OR REPLACE INTO users (username, email, name) VALUES (?, ?, ?)`,
      [username, email, name],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT username, name, email FROM users`, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ========== SOCKET.IO CONNECTION ==========
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);
  
  // User joins
  socket.on('user-join', async (userData) => {
    const username = userData.name || userData.email || userData.username || userData;
    const room = userData.room || 'general';
    
    socket.username = username;
    socket.room = room;
    
    // Save user to database
    try {
      await saveUser(username, userData.email || `${username}@temp.com`, userData.name || username);
    } catch (err) {
      console.log('User already exists or error:', err.message);
    }
    
    onlineUsers.set(socket.id, { username: username, room: room });
    
    // Join socket room
    socket.join(room);
    
    // Send online users list to everyone in the room
    const usersInRoom = Array.from(onlineUsers.values())
      .filter(u => u.room === room)
      .map(u => u.username);
    
    io.to(room).emit('online-users', usersInRoom);
    
    // Send message history
    try {
      const history = await getMessages(room);
      socket.emit('message-history', history);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
    
    // Notify everyone that a user joined
    io.to(room).emit('user-joined', { 
      username: username, 
      message: `${username} joined the chat`,
      timestamp: new Date().toISOString()
    });
    
    console.log(`${username} joined room: ${room}. Users in room:`, usersInRoom);
  });
  
  // Handle sending messages (GROUP CHAT - everyone sees)
  socket.on('send-message', async (data) => {
    const room = socket.room || 'general';
    const messageData = {
      id: Date.now(),
      from_user: socket.username,
      to_user: data.to || 'everyone',
      message: data.message,
      room: room,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    console.log(`[${room}] ${socket.username}: ${data.message}`);
    
    // Save to database
    try {
      await saveMessage(socket.username, data.to || 'everyone', data.message, room);
    } catch (err) {
      console.error('Error saving message:', err);
    }
    
    // Send to EVERYONE in the room (group chat)
    io.to(room).emit('new-message', messageData);
    
    // Send notification to all users in room
    io.to(room).emit('notification', {
      id: Date.now(),
      title: 'New Message',
      body: `${socket.username}: ${data.message.substring(0, 50)}`,
      from: socket.username,
      room: room
    });
  });
  
  // Private message (1-on-1)
  socket.on('private-message', async (data) => {
    const { to, message } = data;
    const from = socket.username;
    
    const messageData = {
      id: Date.now(),
      from_user: from,
      to_user: to,
      message: message,
      room: 'private',
      timestamp: new Date().toISOString(),
      read: false
    };
    
    console.log(`[PRIVATE] ${from} -> ${to}: ${message}`);
    
    // Save to database
    try {
      await saveMessage(from, to, message, 'private');
    } catch (err) {
      console.error('Error saving private message:', err);
    }
    
    // Find recipient socket
    let recipientSocketId = null;
    for (let [id, user] of onlineUsers) {
      if (user.username === to) {
        recipientSocketId = id;
        break;
      }
    }
    
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('private-message', messageData);
      socket.emit('private-message-sent', messageData);
      
      // Send notification to recipient
      io.to(recipientSocketId).emit('notification', {
        id: Date.now(),
        title: `Private message from ${from}`,
        body: message.substring(0, 50),
        from: from,
        isPrivate: true
      });
    } else {
      socket.emit('private-message-error', { to: to, message: 'User is offline' });
    }
  });
  
  // Handle typing indicator (broadcast to room)
  socket.on('typing', (data) => {
    const room = socket.room || 'general';
    socket.to(room).emit('user-typing', { 
      from: socket.username, 
      isTyping: data.isTyping 
    });
  });
  
  // Change room
  socket.on('join-room', async (room) => {
    const oldRoom = socket.room;
    socket.leave(oldRoom);
    socket.room = room;
    socket.join(room);
    
    // Update online users in both rooms
    const oldRoomUsers = Array.from(onlineUsers.values())
      .filter(u => u.room === oldRoom)
      .map(u => u.username);
    io.to(oldRoom).emit('online-users', oldRoomUsers);
    
    const newRoomUsers = Array.from(onlineUsers.values())
      .filter(u => u.room === room)
      .map(u => u.username);
    io.to(room).emit('online-users', newRoomUsers);
    
    // Send new room history
    try {
      const history = await getMessages(room);
      socket.emit('message-history', history);
    } catch (err) {
      console.error('Error fetching room history:', err);
    }
    
    console.log(`${socket.username} switched from ${oldRoom} to ${room}`);
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      onlineUsers.delete(socket.id);
      const room = user.room;
      const usersInRoom = Array.from(onlineUsers.values())
        .filter(u => u.room === room)
        .map(u => u.username);
      io.to(room).emit('online-users', usersInRoom);
      io.to(room).emit('user-left', { 
        username: user.username, 
        message: `${user.username} left the chat` 
      });
      console.log(`${user.username} disconnected`);
    }
  });
});

// ========== EXPRESS ROUTES ==========
app.use(helmet());
app.use(cors());
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Import routes
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');

// Mount routes
app.use(`${API_PREFIX}/users`, usersRouter);
app.use(`${API_PREFIX}/auth`, authRouter.router);

// Get all registered users for chat
app.get(`${API_PREFIX}/chat-users`, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ status: 'success', data: users });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Get messages for a room
app.get(`${API_PREFIX}/messages/:room`, async (req, res) => {
  const room = req.params.room;
  try {
    const messages = await getMessages(room);
    res.status(200).json({ status: 'success', data: messages });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Health check (no API prefix)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Project 2 API is running!',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Project 2 API',
    endpoints: {
      auth: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        me: 'GET /api/v1/auth/me'
      },
      users: {
        list: 'GET /api/v1/users',
        get: 'GET /api/v1/users/:id',
        create: 'POST /api/v1/users',
        update: 'PUT /api/v1/users/:id',
        delete: 'DELETE /api/v1/users/:id'
      },
      chat: {
        users: 'GET /api/v1/chat-users',
        messages: 'GET /api/v1/messages/:room'
      },
      health: 'GET /health'
    }
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 PROJECT 2 API - DECODELABS                             ║
║                                                              ║
║   Server running on: http://localhost:${PORT}                ║
║   API Version: v1                                           ║
║   Chat: Socket.IO enabled                                   ║
║   Database: SQLite (chat.db)                                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log(`🔗 Users endpoint: http://localhost:${PORT}${API_PREFIX}/users`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}${API_PREFIX}/auth`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}${API_PREFIX}/chat-users`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});