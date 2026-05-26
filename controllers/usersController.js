// controllers/usersController.js
const { getNextId, paginate, sanitizeInput } = require('../utils/helpers');

// In-memory database
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', createdAt: new Date().toISOString() },
  { id: 2, name: 'Bob', email: 'bob@example.com', createdAt: new Date().toISOString() }
];

// GET all users (with pagination)
const getAllUsers = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  const result = paginate(users, page, limit);
  
  res.status(200).json({
    status: 'success',
    data: result.data,
    pagination: {
      currentPage: result.page,
      itemsPerPage: result.limit,
      totalItems: result.total,
      totalPages: result.totalPages,
      hasNext: !!result.next,
      hasPrev: !!result.prev
    }
  });
};

// GET user by ID
const getUserById = (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({
      status: 'error',
      message: `User with id ${id} not found`
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: user
  });
};

// POST - Create new user
const createUser = (req, res) => {
  const { name, email } = req.body;
  
  // Sanitize inputs
  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = sanitizeInput(email).toLowerCase();
  
  // Check for duplicate email
  const emailExists = users.find(u => u.email === sanitizedEmail);
  if (emailExists) {
    return res.status(400).json({
      status: 'error',
      message: 'A user with this email already exists'
    });
  }
  
  const newUser = {
    id: getNextId(),
    name: sanitizedName,
    email: sanitizedEmail,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    data: newUser
  });
};

// PUT - Update entire user (full replacement)
const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;
  
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: `User with id ${id} not found`
    });
  }
  
  // Check for duplicate email (excluding current user)
  const emailExists = users.find(u => u.email === email && u.id !== id);
  if (emailExists) {
    return res.status(400).json({
      status: 'error',
      message: 'Another user already has this email'
    });
  }
  
  const updatedUser = {
    id: id,
    name: sanitizeInput(name),
    email: sanitizeInput(email).toLowerCase(),
    updatedAt: new Date().toISOString(),
    createdAt: users[userIndex].createdAt
  };
  
  users[userIndex] = updatedUser;
  
  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: updatedUser
  });
};

// PATCH - Partial update (update only provided fields)
const patchUser = (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: `User with id ${id} not found`
    });
  }
  
  // Apply updates only for provided fields
  if (updates.name) {
    users[userIndex].name = sanitizeInput(updates.name);
  }
  
  if (updates.email) {
    const sanitizedEmail = sanitizeInput(updates.email).toLowerCase();
    // Check for duplicate email
    const emailExists = users.find(u => u.email === sanitizedEmail && u.id !== id);
    if (emailExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Another user already has this email'
      });
    }
    users[userIndex].email = sanitizedEmail;
  }
  
  users[userIndex].updatedAt = new Date().toISOString();
  
  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
    data: users[userIndex]
  });
};

// DELETE - Remove user
const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({
      status: 'error',
      message: `User with id ${id} not found`
    });
  }
  
  const deletedUser = users[userIndex];
  users.splice(userIndex, 1);
  
  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
    data: deletedUser
  });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser
};