// middleware/errorHandler.js

// 404 handler for routes not found
const notFound = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error('Server error:', err.message);
  console.error(err.stack);
  
  // Check for specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      details: err.message
    });
  }
  
  // Default internal server error
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};

module.exports = { notFound, errorHandler };