# 📦 Backend API - Complete Documentation

## Project 2 API - DecodeLabs

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Live API & Deployment](#live-api--deployment)
3. [Tech Stack](#tech-stack)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [Project Structure](#project-structure)
7. [API Endpoints](#api-endpoints)
8. [Socket.IO Events](#socketio-events)
9. [Database Schema](#database-schema)
10. [Error Handling](#error-handling)
11. [Running the Server](#running-the-server)
12. [Testing](#testing)
13. [Deployment](#deployment)

---

## Project Overview

A production-ready RESTful API backend for the DecodeLabs Project 2 Full Stack Development internship. This API provides user authentication, CRUD operations, real-time chat capabilities, and comprehensive error handling.

- **Live API:** https://project2-api-giu-nexus-deploy.up.railway.app
- **Frontend Repository:** [Ali-Zaher-1/project2-dashboard](https://github.com/Ali-Zaher-1/project2-dashboard)

### ✨ Features

| Feature | Status | Description |
|---|---|---|
| JWT Authentication | ✅ | Secure token-based authentication |
| Password Hashing | ✅ | bcrypt with 10 salt rounds |
| User CRUD Operations | ✅ | Create, Read, Update, Delete |
| Pagination | ✅ | Page-based user listing |
| Rate Limiting | ✅ | 100 requests per 15 minutes |
| Input Validation | ✅ | Express-validator middleware |
| Global Error Handling | ✅ | Centralized error handler |
| Real-time Chat | ✅ | Socket.IO integration |
| SQLite Database | ✅ | Lightweight persistent storage |

---

## Live API & Deployment

| Service | URL |
|---|---|
| **Live API Root** | https://project2-api-giu-nexus-deploy.up.railway.app |
| **Health Check** | https://project2-api-giu-nexus-deploy.up.railway.app/health |
| **API Endpoints** | https://project2-api-giu-nexus-deploy.up.railway.app/api/v1 |
| **Deployment Platform** | Railway |

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
| `PORT` | Yes | `3000` | Server port |
| `NODE_ENV` | Yes | `development` | Environment mode |
| `JWT_SECRET` | Yes | — | Secret key for JWT signing |
| `API_PREFIX` | No | `/api/v1` | API route prefix |
| `API_VERSION` | No | `v1` | API version |
| `DATABASE_URL` | No | `./chat.db` | SQLite database path |
| `CLIENT_URL` | No | `http://localhost:3001` | Frontend URL for CORS |

---

## Project Structure

```text
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
└── README.md                  # Documentation
```

---

## API Endpoints

### Base URL

```text
http://localhost:3000                                              (local)
https://project2-api-giu-nexus-deploy.up.railway.app             (production)
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

#### Get Current User *(Protected)*

```http
GET /api/v1/auth/me
```

**Headers:**

```text
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
| `page` | number | `1` | Page number |
| `limit` | number | `5` | Items per page |

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

#### Update User *(Protected)*

```http
PUT /api/v1/users/:id
```

**Headers:**

```text
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

#### Delete User *(Protected)*

```http
DELETE /api/v1/users/:id
```

**Headers:**

```text
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

```text
https://project2-api-giu-nexus-deploy.up.railway.app
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

### Server → Client Events

#### New Message

```javascript
socket.on('new-message', (message) => {
  console.log('New message:', message);
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
  console.log(`${data.from} is typing...`);
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

---

## Error Handling

### HTTP Status Codes

| Code | Name | Description |
|---|---|---|
| `200` | OK | Request successful |
| `201` | Created | Resource created |
| `400` | Bad Request | Invalid input |
| `401` | Unauthorized | Authentication required |
| `404` | Not Found | Resource not found |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

### Error Response Format

```json
{
  "error": "Error message description",
  "status": "error"
}
```

---

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

**Expected Output:**

```text
✅ Database ready

╔══════════════════════════════════════════════════════════════╗
║   🚀 PROJECT 2 API - DECODELABS                             ║
║   Server running on: http://localhost:3000                  ║
║   API Version: v1                                           ║
║   Chat: Socket.IO enabled                                   ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Testing

### Test Health Endpoint

```bash
curl https://project2-api-giu-nexus-deploy.up.railway.app/health
```

### Test User Registration

```bash
curl -X POST https://project2-api-giu-nexus-deploy.up.railway.app/api/v1/auth/register \
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
curl -X POST https://project2-api-giu-nexus-deploy.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "test123456"
  }'
```

---

## Deployment

### Current Deployment: Railway.app

**Live URL:** https://project2-api-giu-nexus-deploy.up.railway.app

**Deployment Settings:**
- **Builder:** NIXPACKS
- **Start Command:** `node index.js`

**Environment Variables:**

| Key | Value |
|---|---|
| `PORT` | `8080` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `<your-secret-key>` |
| `DATABASE_URL` | `/tmp/chat.db` |

### Deploy to Railway (Your Own Instance)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Add environment variables (see above)
6. Railway auto-deploys ✅

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

## 👨‍💻 Author

**Ali Zaher**

- **GitHub:** [@Ali-Zaher-1](https://github.com/Ali-Zaher-1)
- **Email:** ali2006ahmed9@gmail.com
- **Project:** DecodeLabs Full Stack Development — Batch 2026

---

## 🔗 Links

- **Live API:** https://project2-api-giu-nexus-deploy.up.railway.app
- **Frontend Dashboard:** https://project2-dashboard-rjdp.vercel.app
- **GitHub Repository:** https://github.com/Ali-Zaher-1/project2-api

---

> Built with 🚀 for DecodeLabs Full Stack Development 2026
