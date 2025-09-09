const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

// Create jwt token
const signToken = (user, authType) => {
  let payload;
  let jwtExpires;

  if (authType === 'signup') {
    payload = user;
    jwtExpires = process.env.JWT_SIGNUP_EXPIRE;
  } else if (authType === 'login') {
    payload = { userId: user.id, otpSecret: user.otpSecret, authType };
    jwtExpires = process.env.JWT_LOGIN_EXPIRE;
  } else if (authType === 'getRealToken') {
    payload = { user };
    jwtExpires = process.env.JWT_EXPIRES_IN;
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: jwtExpires,
  });
};

// Send jwt token
exports.createSendToken = (user, statusCode, req, res, authType) => {
  const token = signToken(user, authType);

  // 60 days
  let expire = new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  );

  // 10 minutes
  if (['signup', 'login'].includes(authType)) {
    expire = new Date(Date.now() + 10 * 60 * 1000);
  }

  // Cookie option
  res.cookie('jwt', token, {
    expires: expire,
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'None',
  });

  // Remove the password from output.
  user.password = undefined;
  user.otpSecret = undefined;

  // Send Response
  res.status(statusCode).json({
    status: 'success',
    token,
    message: ['signup', 'login'].includes(authType)
      ? 'OTP successfully sent!'
      : '',
    data: {
      user,
    },
  });
};

// protecting the routes
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  let decode;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new AppError('You are not logged in, Please login to get access :)', 401)
    );

  try {
    decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid token!', err.statusCode));
  }

  if (['signup', 'login'].includes(decode.authType)) {
    return next(
      new AppError('Please verify your account then try again!', 401)
    );
  }

  const currentUser = decode.user;

  if (!currentUser) {
    return next(
      new AppError('The user belong to this token does not exist :(', 401)
    );
  }

  req.user = currentUser;

  next();
});

// Role based action access controll
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 401)
      );
    }
    next();
  };
};
