const AuthService = require('../services/authService');
const { catchAsync, AppError } = require('../utils');
const { authMiddleware } = require('../api/middlewares');
const { AuthConfig, Email } = require('../utils');
const { upload } = require('../config');

module.exports = (app, channel) => {
  const service = new AuthService();
  service.RPCObserver(channel);
  const baseUrl = process.env.API_BASE_URL_AUTH;

  /**
   * @swagger
   * /api/v2/auth/profile:
   *   get:
   *     summary: Get logged-in user profile
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Auth
   *     responses:
   *       200:
   *         description: Successfully fetched user!
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   */

  // 🔹Get loggedin user profile
  app.get(
    `${baseUrl}/profile`,
    authMiddleware.protect,
    async (req, res, next) => {
      try {
        const id = req.user._id;
        const { data } = await service.GetProfile({ id });
        res.status(200).json({
          status: 'success',
          message: 'Successfully fetched user!',
          data: {
            user: data.user,
          },
        });
      } catch (err) {
        next(new AppError(err.message, err.statusCode));
      }
    }
  );

  /**
   * @swagger
   * /api/v2/auth/magic-login:
   *   get:
   *     summary: Verify magic login link
   *     tags:
   *       - Auth
   *     parameters:
   *       - in: query
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *         description: Magic login token
   *     responses:
   *       201:
   *         description: User logged in via magic link
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                     user:
   *                       type: object
   */

  // 🔹Verify magic-login link
  app.get(
    `${baseUrl}/magic-login`,
    catchAsync(async (req, res, next) => {
      const { token } = req.query;

      if (!token)
        return next(new AppError('invalid token please try again', 400));

      const { data } = await service.VerifyLoginLink({ token });
      const authConfig = new AuthConfig();
      const loggedUserInfo = await authConfig.getLoggedInUserInfo(req);
      await new Email(data.user, '', {
        loggedUserInfo,
      }).sendLoginEmail();

      authMiddleware.createSendToken(data.user, 201, req, res, 'getRealToken');
    })
  );

  /**
   * @swagger
   * /api/v2/auth/statistics:
   *   get:
   *     summary: Get user statistics (admin only)
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Auth
   *     responses:
   *       200:
   *         description: Successfully fetched user statistics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     userStats:
   *                       type: object
   */

  // 🔹Get user statistics (ADMIN)
  app.get(
    `${baseUrl}/statistics`,
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    async (req, res) => {
      const { data } = await service.GetUserStatistics();
      res.status(200).json({
        status: 'success',
        message: 'Successfully fetched users statistics!',
        data: {
          userStats: data,
        },
      });
    }
  );

  /**
   * @swagger
   * /api/v2/auth/user/{id}:
   *   get:
   *     summary: Get user by ID
   *     tags:
   *       - Auth
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: Successfully fetched user
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   */

  // 🔹Get user by ID
  app.get(
    `${baseUrl}/user/:id`,
    catchAsync(async (req, res, next) => {
      const { id } = req.params;
      if (!id) {
        return next(new AppError('Please provide user ID', 400));
      }
      const user = await service.getUserById({ id });
      res.status(200).json({
        status: 'success',
        message: 'Successfully fetched user!',
        data: {
          user,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/auth/signup:
   *   post:
   *     summary: Request OTP for signup
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               role:
   *                 type: string
   *     responses:
   *       201:
   *         description: Signup OTP sent and user created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                     user:
   *                       type: object
   */

  // 🔹 Request OTP for signup
  app.post(
    `${baseUrl}/signup`,
    catchAsync(async (req, res, next) => {
      const { name, email, password, role } = req.body;
      const { data } = await service.RequestSignupOTP({
        name,
        email,
        password,
        role,
      });
      authMiddleware.createSendToken(data.user, 201, req, res, 'signup');
    })
  );

  /**
   * @swagger
   * /api/v2/auth/login:
   *   post:
   *     summary: Request OTP for login
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login OTP sent
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                     user:
   *                       type: object
   */

  // 🔹Request OTP for login
  app.post(
    `${baseUrl}/login`,
    catchAsync(async (req, res, next) => {
      if (!req.body)
        return next(new AppError('Email and password required!', 400));

      const { email, password } = req.body;

      if (!email || !password) {
        return next(
          new AppError('Please provide your email and password!', 400)
        );
      }
      const { data } = await service.RequestLoginOTP({ email, password });

      authMiddleware.createSendToken(data.user, 200, req, res, 'login');
    })
  );

  /**
   * @swagger
   * /api/v2/auth/resend-otp:
   *   post:
   *     summary: Resend OTP for signup or login flows
   *     tags:
   *       - Auth
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - mode
   *             properties:
   *               mode:
   *                 type: string
   *                 enum: [signup, login]
   *                 description: Indicates whether OTP is for signup or login flow
   *     responses:
   *       200:
   *         description: OTP resent successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 token:
   *                   type: string
   *                   description: JWT token containing updated OTP secret
   *       400:
   *         description: Invalid mode or token
   *       401:
   *         description: Unauthorized or expired token
   *       500:
   *         description: Internal server error
   */

  app.post(
    `${baseUrl}/resend-otp`,
    catchAsync(async (req, res, next) => {
      const { mode } = req.body;
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
      }

      const { data } = await service.ResentOtp({ mode, token });

      if (!data) return next(new AppError('Failed to send OTP!', 500));

      authMiddleware.createSendToken(data.user, 200, req, res, data.mode);
    })
  );

  /**
   * @swagger
   * /api/v2/auth/login-link:
   *   post:
   *     summary: Request magic login link (passwordless)
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: Magic login link sent
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   */

  // 🔹Request magic-link for login without password
  app.post(
    `${baseUrl}/login-link`,
    catchAsync(async (req, res, next) => {
      const { email } = req.body;
      const { data } = await service.RequestLoginLink({ email });
      res.status(200).json({
        status: 'success',
        message: data.message,
      });
    })
  );

  /**
   * @swagger
   * /api/v2/auth/verify-otp:
   *   post:
   *     summary: Verify OTP for signup or login
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               otp:
   *                 type: string
   *               mode:
   *                 type: string
   *                 description: signup or login
   *     responses:
   *       201:
   *         description: OTP verified and user logged in
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                     user:
   *                       type: object
   */

  // 🔹 Verify-OTP
  app.post(
    `${baseUrl}/verify-otp`,
    catchAsync(async (req, res, next) => {
      const { otp, mode } = req.body;
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
      ) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
      }

      if (!token) {
        return next(new AppError('Unauthorized request! :(', 401));
      }

      const { data } = await service.VerifyOTP({ otp, mode, token });

      const authConfig = new AuthConfig();

      const loggedUserInfo = await authConfig.getLoggedInUserInfo(req);

      await new Email(data.loggingUser, '', {
        loggedUserInfo,
      }).sendLoginEmail();

      authMiddleware.createSendToken(
        data.loggingUser,
        201,
        req,
        res,
        'getRealToken'
      );
    })
  );

  /**
   * @swagger
   * /api/v2/auth/logout:
   *   post:
   *     summary: Logout user
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Auth
   *     responses:
   *       200:
   *         description: Logout successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   */

  // 🔹Logout
  app.post(`${baseUrl}/logout`, authMiddleware.protect, async (req, res) => {
    try {
      res.clearCookie('jwt', { httpOnly: true });
      res.status(200).json({
        message: 'Logout successfully :)',
      });
    } catch (err) {
      throw new AppError('Failed to logout!', 500);
    }
  });

  /**
   * @swagger
   * /api/v2/auth/profile:
   *   patch:
   *     summary: Update user profile
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Auth
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               coverImage:
   *                 type: string
   *                 format: binary
   *                 description: (jpeg, png, jpg, etc...)
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   */

  // 🔹Update profile
  app.patch(
    `${baseUrl}/profile`,
    authMiddleware.protect,
    upload.single('coverImage'),
    catchAsync(async (req, res, next) => {
      let file = '';
      const reqObj = req.body;
      const id = req.user._id;

      if (req.body.password) {
        return next(
          new AppError('This route is not for password update!', 400)
        );
      }

      if (req.file) {
        file = req.file;
      }

      const { data } = await service.UpdateProfile({ reqObj, file, id });

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully!',
        data: {
          user: data.user,
        },
      });
    })
  );
};
