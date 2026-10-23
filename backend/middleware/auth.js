const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Verifies the Bearer token and attaches the fresh user record to req.user.
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError('Please log in to continue.', 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError('Your session has expired. Please log in again.', 401);
  }

  const user = await User.findById(payload.id);
  if (!user || !user.isActive) throw new AppError('This account is no longer available.', 401);

  req.user = user;
  next();
});

// Role-based authorization. Always use AFTER protect.
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to do that.', 403));
  }
  next();
};

module.exports = { protect, authorize };
