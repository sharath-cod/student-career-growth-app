const AppError = require('../utils/AppError');

const notFound = (req, res, next) => next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong.';
  let details = err.details;

  // Duplicate key (unique index)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    const label = field === 'usn' ? 'USN' : field;
    message = ['usn', 'email'].includes(field) ? `This ${label} is already registered.` : 'This entry already exists.';
    details = { [field]: message };
  }
  if (err.name === 'ValidationError' && err.errors) {
    status = 422;
    details = {};
    Object.values(err.errors).forEach((e) => (details[e.path] = e.message));
    message = 'Please fix the highlighted fields.';
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'The file is larger than 2 MB.';
  }
  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier supplied.';
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    message: status >= 500 && process.env.NODE_ENV === 'production' ? 'Something went wrong.' : message,
    errors: details,
  });
};

module.exports = { notFound, errorHandler };
