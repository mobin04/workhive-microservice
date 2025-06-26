const AppError = require('../../utils/appError');

// HANDLING INVALID DATABASE IDs
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// HANDLING DUPLICATE DATABASE FIELDS
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: '${err.keyValue.name}' Please use another value!`;
  return new AppError(message, 400);
};

//HANDLE VALIDATION ERROR
const handleValidationErrorDB = (err) => {
  //loop over the error message.
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// HANDLE JSONWEBTOKEN ERROR
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

// HANDLE JWT EXPIRED ERROR
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// Handle error in development.
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(err.statusCode).json({
    message: err.message,
    title: 'Something went wrong :(',
  });
};

// Handle error in production.
const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        message: err.message,
        status: err.status,
      });
    }
    return res.status(err.statusCode).json({
      message: 'Something went wrong :(',
      status: 'fail',
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      title: 'Something went wrong :(',
      message: err.message,
    });
  }

  // Programming or any unknown error
  return res.status(err.statusCode).json({
    title: 'Something went very wrong :(',
    message: 'Please try again later',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message || "Internal Server Error"

    // HANDLING INVALID DATABASE IDs
    if (err.name === 'CastError') error = handleCastErrorDB(error);

    // HANDLING DUPLICATE DATABASE FIELDS
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);

    // HANDLING MONGOOSE VALIDATION ERROR
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    // HANDLE JSONWEBTOKEN ERROR
    if (err.name === 'JsonWebTokenError') error = handleJWTError();

    // HANDLE JWT TOKEN EXPIRES ERROR
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(err, req, res);
  }
};
