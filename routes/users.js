// routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');

const router = express.Router();

// GET all users (from real database)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  
  try {
    // Get total count
    const total = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        resolve(row ? row.count : 0);
      });
    });
    
    // Get paginated users
    const users = await new Promise((resolve) => {
      db.all(
        'SELECT id, username, email, name, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?',
        [limit, offset],
        (err, rows) => {
          resolve(rows || []);
        }
      );
    });
    
    res.json({
      status: 'success',
      data: users,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasPrev: page > 1,
        hasNext: page < Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET single user by ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    const user = await new Promise((resolve) => {
      db.get('SELECT id, username, email, name, created_at FROM users WHERE id = ?', [id], (err, row) => {
        resolve(row);
      });
    });
    
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    
    res.json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// CREATE new user
router.post('/', async (req, res) => {
  const { username, email, name, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  try {
    // Check if user exists
    const existing = await new Promise((resolve) => {
      db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
        resolve(row);
      });
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Insert user
    const result = await new Promise((resolve) => {
      db.run(
        'INSERT INTO users (username, email, name, password_hash) VALUES (?, ?, ?, ?)',
        [username, email || `${username}@temp.com`, name || username, password_hash],
        function(err) {
          resolve({ id: this.lastID, err });
        }
      );
    });
    
    if (result.err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.status(201).json({
      status: 'success',
      data: {
        id: result.id,
        username: username,
        email: email || `${username}@temp.com`,
        name: name || username,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE user
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { username, email, name, password } = req.body;
  
  try {
    let query = 'UPDATE users SET ';
    const updates = [];
    const values = [];
    
    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      values.push(password_hash);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    query += updates.join(', ') + ' WHERE id = ?';
    values.push(id);
    
    await new Promise((resolve) => {
      db.run(query, values, function(err) {
        resolve({ changes: this.changes, err });
      });
    });
    
    // Get updated user
    const user = await new Promise((resolve) => {
      db.get('SELECT id, username, email, name, created_at FROM users WHERE id = ?', [id], (err, row) => {
        resolve(row);
      });
    });
    
    res.json({ status: 'success', data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    await new Promise((resolve) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        resolve({ changes: this.changes, err });
      });
    });
    
    res.json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;