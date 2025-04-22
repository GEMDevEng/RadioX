const csrf = require('csurf');
const { v4: uuidv4 } = require('uuid');

// Configure CSRF protection
const csrfProtection = csrf({
  cookie: {
    key: 'XSRF-TOKEN',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  },
});

// Middleware to handle CSRF errors
const handleCsrfError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  // Handle CSRF token errors
  res.status(403);
  res.json({
    message: 'Invalid or expired CSRF token. Please refresh the page and try again.',
  });
};

// Middleware to set CSRF token
const setCsrfToken = (req, res, next) => {
  // Generate a unique request ID for tracking
  req.requestId = uuidv4();
  
  // Set CSRF token in response header for frontend to use
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  
  next();
};

module.exports = {
  csrfProtection,
  handleCsrfError,
  setCsrfToken,
};
