// utils/helpers.js

// Generate unique ID (simple version)
let currentId = 3; // Start after Alice(1), Bob(2)

const getNextId = () => {
  return ++currentId;
};

// Pagination helper
const paginate = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const results = {};
  
  if (endIndex < data.length) {
    results.next = { page: page + 1, limit };
  }
  
  if (startIndex > 0) {
    results.prev = { page: page - 1, limit };
  }
  
  results.data = data.slice(startIndex, endIndex);
  results.total = data.length;
  results.page = page;
  results.limit = limit;
  results.totalPages = Math.ceil(data.length / limit);
  
  return results;
};

// Sanitize input (prevent XSS)
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

module.exports = { getNextId, paginate, sanitizeInput };