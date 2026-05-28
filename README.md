# 📦 Backend API - Complete Documentation
## Project 2 API - DecodeLabs

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Installation](#installation)
4. [Environment Variables](#environment-variables)
5. [Project Structure](#project-structure)
6. [API Endpoints](#api-endpoints)
7. [Socket.IO Events](#socketio-events)
8. [Database Schema](#database-schema)
9. [Error Handling](#error-handling)
10. [Middleware](#middleware)
11. [Running the Server](#running-the-server)
12. [Testing](#testing)
13. [Deployment](#deployment)

---

## Project Overview

A production-ready RESTful API backend for the DecodeLabs Project 2 Full Stack Development internship. This API provides user authentication, CRUD operations, real-time chat capabilities, and comprehensive error handling.

Live API: https://project2-api-giu-nexus-deploy.up.railway.app

Frontend Repository: project2-dashboard

### ✨ Features

| Feature | Status | Description |
|---|---|---|
| JWT Authentication | ✅ | Secure token-based authentication |
| Password Hashing | ✅ | bcrypt with 10 salt rounds |
| User CRUD Operations | ✅ | Create, Read, Update, Delete |
| Pagination | ✅ | Page-based user listing |
| Rate Limiting | ✅ | 100 requests per 15 minutes |
| Input Validation | ✅ | Express-validator middleware |
| Request Logging | ✅ | Console + file logging |
| Global Error Handling | ✅ | Centralized error handler |
| CORS Enabled | ✅ | Cross-origin resource sharing |
| Security Headers | ✅ | Helmet.js protection |
| Real-time Chat | ✅ | Socket.IO integration |
| SQLite Database | ✅ | Lightweight persistent storage |

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18.x | JavaScript runtime |
| Express.js | 4.x | Web framework |
| SQLite3 | 5.x | Database |
| Socket.IO | 4.x | Real-time communication |
| JSON Web Token | 9.x | Authentication |
| bcrypt | 5.x | Password hashing |
| Helmet | 7.x | Security headers |
| CORS | 2.x | Cross-origin middleware |
| Express Validator | 6.x | Input validation |
| Express Rate Limit | 6.x | Rate limiting |
| Dotenv | 16.x | Environment variables |

---

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Steps

```bash
# Clone the repository
git clone https://github.com/Ali-Zaher-1/project2-api.git
cd project2-api

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env with your values (see below)

# Start the server
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-this-in-production

# API Configuration
API_PREFIX=/api/v1
API_VERSION=v1

# Database
DATABASE_URL=./chat.db

# CORS
CLIENT_URL=http://localhost:3001
```

### Environment Variables Explained

| Variable | Required | Default | Description |
|---|---|---|---|
| PORT | Yes | 3000 | Server port |
| NODE_ENV | Yes | development | Environment mode |
| JWT_SECRET | Yes | - | Secret key for JWT signing |
| API_PREFIX | No | /api/v1 | API route prefix |
| API_VERSION | No | v1 | API version |
| DATABASE_URL | No | ./chat.db | SQLite database path |
| CLIENT_URL | No | http://localhost:3001 | Frontend URL for CORS |

---

## Project Structure

```
project2-api/
│
├── controllers/
│   └── usersController.js     # User business logic
│
├── middleware/
│   ├── auth.js                # JWT verification middleware
│   ├── errorHandler.js        # Global error handler
│   ├── logger.js              # Request logging middleware
│   ├── rateLimiter.js         # Rate limiting middleware
│   └── validate.js            # Input validation middleware
│
├── routes/
│   ├── auth.js                # Authentication routes
│   └── users.js               # User CRUD routes
│
├── utils/
│   └── helpers.js             # Helper functions
│
├── .env                       # Environment variables (not committed)
├── .env.example               # Environment template (committed)
├── .gitignore                 # Git ignore file
├── database.js                # SQLite database setup
├── index.js                   # Main server entry point
├── package.json               # Dependencies and scripts
├── package-lock.json          # Locked dependencies
└── README.md                  # Documentation
```

---

## API Endpoints

### Base URL

```
http://localhost:3000
https://project2-api.onrender.com  (production)
```

---

### Authentication Endpoints

#### Register New User

```http
POST /api/v1/auth/register
```

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Validation Rules:**
- `username`: Required, minimum 3 characters
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `name`: Optional

---

#### Login

```http
POST /api/v1/auth/login
```

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (401 Unauthorized):**

```json
{
  "error": "Invalid username or password"
}
```

---

#### Get Current User (Protected)

```http
GET /api/v1/auth/me
```

**Headers:**

```
Authorization: Bearer <your-token>
```

**Response (200 OK):**

```json
{
  "user": {
    "userId": 1,
    "username": "johndoe"
  }
}
```

---

### User Management Endpoints

#### Get All Users (Paginated)

```http
GET /api/v1/users?page=1&limit=5
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| page | number | 1 | Page number |
| limit | number | 5 | Items per page |

**Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "name": "John Doe",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 5,
    "totalItems": 10,
    "totalPages": 2,
    "hasPrev": false,
    "hasNext": true
  }
}
```

---

#### Get User by ID

```http
GET /api/v1/users/:id
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404 Not Found):**

```json
{
  "status": "error",
  "message": "User not found"
}
```

---

#### Create New User

```http
POST /api/v1/users
```

**Request Body:**

```json
{
  "username": "janedoe",
  "email": "jane@example.com",
  "name": "Jane Doe",
  "password": "password123"
}
```

**Response (201 Created):**

```json
{
  "status": "success",
  "data": {
    "id": 3,
    "username": "janedoe",
    "email": "jane@example.com",
    "name": "Jane Doe",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### Update User (Protected)

```http
PUT /api/v1/users/:id
```

**Headers:**

```
Authorization: Bearer <your-token>
```

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com"
}
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "id": 3,
    "username": "janedoe",
    "email": "jane.smith@example.com",
    "name": "Jane Smith",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### Delete User (Protected)

```http
DELETE /api/v1/users/:id
```

**Headers:**

```
Authorization: Bearer <your-token>
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

---

### Chat Endpoints

#### Get All Chat Users

```http
GET /api/v1/chat-users
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "username": "johndoe",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### Get Messages for a Room

```http
GET /api/v1/messages/:room
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "from_user": "johndoe",
      "to_user": "everyone",
      "message": "Hello everyone!",
      "room": "general",
      "read": 0,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### Health Check

```http
GET /health
```

**Response (200 OK):**

```json
{
  "status": "ok",
  "message": "Project 2 API is running!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345.67
}
```

---

#### Root Endpoint

```http
GET /
```

**Response (200 OK):**

```json
{
  "status": "success",
  "message": "Welcome to Project 2 API",
  "endpoints": {
    "auth": {
      "register": "POST /api/v1/auth/register",
      "login": "POST /api/v1/auth/login",
      "me": "GET /api/v1/auth/me"
    },
    "users": {
      "list": "GET /api/v1/users",
      "get": "GET /api/v1/users/:id",
      "create": "POST /api/v1/users",
      "update": "PUT /api/v1/users/:id",
      "delete": "DELETE /api/v1/users/:id"
    },
    "chat": {
      "users": "GET /api/v1/chat-users",
      "messages": "GET /api/v1/messages/:room"
    },
    "health": "GET /health"
  }
}
```

---

## Socket.IO Events

### Connection URL

```
http://localhost:3000
```

### Client → Server Events

#### User Join

```javascript
socket.emit('user-join', {
  name: 'John Doe',
  email: 'john@example.com',
  room: 'general'
});
```

#### Send Message

```javascript
socket.emit('send-message', {
  message: 'Hello everyone!',
  to: 'everyone'
});
```

#### Typing Indicator

```javascript
socket.emit('typing', {
  isTyping: true,
  to: 'everyone'
});
```

#### Private Message

```javascript
socket.emit('private-message', {
  to: 'johndoe',
  message: 'Hello privately!'
});
```

---

### Server → Client Events

#### Message History

```javascript
socket.on('message-history', (messages) => {
  console.log('Message history:', messages);
});
```

#### New Message

```javascript
socket.on('new-message', (message) => {
  console.log('New message:', message);
  // message: { from_user, message, timestamp, id }
});
```

#### Online Users

```javascript
socket.on('online-users', (users) => {
  console.log('Online users:', users);
});
```

#### User Typing

```javascript
socket.on('user-typing', (data) => {
  console.log(`${data.from} is ${data.isTyping ? 'typing...' : 'stopped typing'}`);
});
```

#### Notification

```javascript
socket.on('notification', (notification) => {
  console.log('Notification:', notification);
  // notification: { title, body, from }
});
```

#### User Joined

```javascript
socket.on('user-joined', (data) => {
  console.log(`${data.username} joined the chat`);
});
```

#### User Left

```javascript
socket.on('user-left', (data) => {
  console.log(`${data.username} left the chat`);
});
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**

```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

---

### Messages Table

```sql
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_user TEXT NOT NULL,
  to_user TEXT,
  message TEXT NOT NULL,
  room TEXT DEFAULT 'general',
  read INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**

```sql
CREATE INDEX idx_messages_room ON messages(room);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_messages_from_user ON messages(from_user);
```

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Error message description",
  "status": "error"
}
```

### HTTP Status Codes

| Code | Name | Description |
|---|---|---|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Examples

**Validation Error (400)**

```json
{
  "error": "Password must be at least 6 characters"
}
```

**Authentication Error (401)**

```json
{
  "error": "Invalid or expired token"
}
```

**Not Found Error (404)**

```json
{
  "error": "User not found"
}
```

**Rate Limit Error (429)**

```json
{
  "error": "Too many requests, please try again later."
}
```

**Server Error (500)**

```json
{
  "error": "Server error: Database connection failed"
}
```

---

## Middleware

### Authentication Middleware (`auth.js`)

```javascript
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### Rate Limiting Middleware (`rateLimiter.js`)

```javascript
const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Validation Middleware (`validate.js`)

```javascript
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  }
];
```

### Logger Middleware (`logger.js`)

```javascript
const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};
```

### Error Handler (`errorHandler.js`)

```javascript
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
```

---

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

**Expected Output:**

```
[nodemon] starting `node index.js`
✅ Database ready

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 PROJECT 2 API - DECODELABS                             ║
║                                                              ║
║   Server running on: http://localhost:3000                  ║
║   API Version: v1                                           ║
║   Chat: Socket.IO enabled                                   ║
║   Database: SQLite (chat.db)                                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

📚 API Documentation: http://localhost:3000/
🔗 Users endpoint: http://localhost:3000/api/v1/users
🔐 Auth endpoint: http://localhost:3000/api/v1/auth
💬 Chat endpoint: http://localhost:3000/api/v1/chat-users
❤️  Health check: http://localhost:3000/health
```

### Production Mode

```bash
npm start
```

---

## Testing

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

### Test User Registration

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "name": "Test User",
    "password": "test123456"
  }'
```

### Test User Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123456"
  }'
```

### Test Get Users (with token)

```bash
TOKEN="your_jwt_token_here"

curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $TOKEN"
```

### Test Create User

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "new@example.com",
    "password": "password123"
  }'
```

### Test Update User

```bash
curl -X PUT http://localhost:3000/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Name"
  }'
```

### Test Delete User

```bash
curl -X DELETE http://localhost:3000/api/v1/users/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Deployment

### Deploy to Render.com

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** project2-api
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add environment variables
7. Click "Create Web Service"

### Deploy to Railway.app

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables
6. Railway auto-deploys

### Deploy to Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create project2-api-decodelabs

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

---

## 📊 API Statistics

| Endpoint | Methods | Protected | Rate Limited |
|---|---|---|---|
| /auth/register | POST | No | Yes |
| /auth/login | POST | No | Yes |
| /auth/me | GET | Yes | Yes |
| /users | GET, POST | GET: No, POST: No | Yes |
| /users/:id | GET, PUT, DELETE | PUT/DELETE: Yes | Yes |
| /chat-users | GET | No | Yes |
| /messages/:room | GET | No | Yes |
| /health | GET | No | No |

---

## 🔒 Security Features

| Feature | Implementation |
|---|---|
| Password Storage | bcrypt hashing (10 salt rounds) |
| Token Expiry | 7 days |
| Rate Limiting | 100 requests/15 minutes |
| Headers Security | Helmet.js |
| Input Sanitization | Express-validator |
| CORS | Restricted to allowed origins |
| SQL Injection | Parameterized queries |

---

## 📝 Scripts

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.2",
    "socket.io": "^4.5.4",
    "sqlite3": "^5.1.6"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues and Solutions

| Issue | Solution |
|---|---|
| EADDRINUSE: address already in use | Change PORT in .env or kill process using port |
| SQLITE_ERROR: table already exists | Delete chat.db and restart |
| JWT_SECRET is required | Add JWT_SECRET to .env |
| CORS error | Check CLIENT_URL in .env |
| Socket.IO connection failed | Verify both servers are running |

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
export DEBUG=socket.io:*

# Run server
npm run dev
```

---

## 📞 Support

For issues or questions:

- Open an issue on [GitHub](https://github.com/Ali-Zaher-1/project2-api)
- Contact: ali2006ahmed9@gmail.com

---

*Built with ❤️ for DecodeLabs Full Stack Development 2026*
