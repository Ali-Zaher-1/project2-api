const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';

// Register a new user
router.post('/register', async (req, res) => {
  console.log('📝 Register request received:', { 
    username: req.body.username, 
    email: req.body.email,
    name: req.body.name 
  });
  
  const { name, email, username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  try {
    // Check if database is accessible
    if (!db) {
      console.error('❌ Database not initialized');
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    // Check if user already exists
    const existing = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE username = ? OR email = ?', 
        [username, email || username], 
        (err, row) => {
          if (err) {
            console.error('Database query error:', err);
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    }).catch(err => {
      console.error('Error checking existing user:', err);
      return null;
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Save user to database
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, name, password_hash) VALUES (?, ?, ?, ?)',
        [username, email || `${username}@temp.com`, name || username, password_hash],
        function(err) {
          if (err) {
            console.error('Insert error:', err);
            reject(err);
          } else {
            resolve({ id: this.lastID });
          }
        }
      );
    }).catch(err => {
      console.error('Error inserting user:', err);
      return null;
    });
    
    if (!result || !result.id) {
      return res.status(500).json({ error: 'Failed to create user. Please try again.' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: result.id, username: username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ User registered successfully:', username);
    
    res.status(201).json({
      success: true,
      token: token,
      user: { 
        id: result.id, 
        username: username, 
        name: name || username, 
        email: email || `${username}@temp.com` 
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('🔐 Login request received:', { username: req.body.username });
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  try {
    // Find user by username or email
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ? OR email = ?', 
        [username, username], 
        (err, row) => {
          if (err) {
            console.error('Database query error:', err);
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
    
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Compare password with hash
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ User logged in successfully:', user.username);
    
    res.json({
      success: true,
      token: token,
      user: { 
        id: user.id, 
        username: user.username, 
        name: user.name,
        email: user.email 
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Verify token middleware
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

// Get current user
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = { router, verifyToken };