const AuthService = require('../services/authService');
const { catchAsync, AppError } = require('../utils');
const { authMiddleware } = require('../api/middlewares');
const { AuthConfig, Email } = require('../utils');
const { upload } = require('../config');
const isValidObjectId = require('./middlewares/isValidObjectId');

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
    authMiddleware.checkSuspension,
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
   * /api/v2/users:
   *   get:
   *     summary: Get all users (Admin only)
   *     tags:
   *       - Users
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of users per page
   *     responses:
   *       200:
   *         description: Users fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 message:
   *                   type: string
   *                   example: Users fetched successfully
   *                 length:
   *                   type: integer
   *                   example: 10
   *                 totalUsers:
   *                   type: integer
   *                   example: 100
   *                 totalPages:
   *                   type: integer
   *                   example: 10
   *                 currentPage:
   *                   type: integer
   *                   example: 1
   *                 data:
   *                   type: object
   *                   properties:
   *                     users:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           _id:
   *                             type: string
   *                             example: 64f0c1234abcd5678ef90123
   *                           name:
   *                             type: string
   *                             example: John Doe
   *                           email:
   *                             type: string
   *                             example: johndoe@example.com
   *                           role:
   *                             type: string
   *                             example: user
   */

  // 🔹Get All Users (Admin only)
  app.get(
    `${baseUrl}/users`,
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    async (req, res) => {
      const { query } = req;
      const { data } = await service.GetAllUsers({ query });
      const { users, totalPages, totalUsers } = data;

      res.status(200).json({
        status: 'success',
        message: 'Users fetched successfully',
        length: users.length,
        totalUsers,
        totalPages,
        currentPage: parseInt(query.page) || 1,
        data: {
          users,
        },
      });
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
   * /api/v2/auth/saved-jobs:
   *   get:
   *     summary: Get the saved jobs from currently logged in user(job_seeker)
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Auth
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the job to get from the saved list
   *     responses:
   *       201:
   *         description: To get job from saved list using the job id
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 totalJobs:
   *                   type: number
   *                 data:
   *                   type: object
   *                   properties:
   *                     jobs:
   *                       type: object
   *       403:
   *         description: No user found with that id!
   */

  // 🔹Get Saved Job
  app.get(
    `${baseUrl}/saved-jobs`,
    authMiddleware.protect,
    authMiddleware.restrictTo('job_seeker'),
    authMiddleware.checkSuspension,
    async (req, res) => {
      const userId = req.user._id;

      const { data } = await service.GetSavedJobs({ userId });

      res.status(200).json({
        status: 'success',
        message: 'fetched saved jobs successfully',
        totalJobs: data.length,
        data: {
          jobs: data,
        },
      });
    }
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
      // console.log(data.logginUser)
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
   * /api/v2/save-job/{id}:
   *   post:
   *     summary: Add a job to the saved list
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Save Jobs
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the job to add to the saved list
   *     responses:
   *       200:
   *         description: Job saved successfully!
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
   *                     job:
   *                       type: object
   *       400:
   *         description: Already saved this job
   *       401:
   *         description: Unauthorized — user not logged in or token invalid
   *       403:
   *         description: Forbidden — user not allowed to perform this action, user type invalid, or user not found
   *       404:
   *         description: No job found with that ID
   */

  // 🔹Save Job
  app.post(
    `${baseUrl}/save-job/:id`,
    authMiddleware.protect,
    authMiddleware.restrictTo('job_seeker'),
    authMiddleware.checkSuspension,
    async (req, res) => {
      const userId = req.user._id;
      const jobId = req.params.id;

      const { data } = await service.SaveJob({ userId, jobId });

      res.status(200).json({
        status: 'success',
        message: 'Job saved successfully!',
        data: {
          user: data,
        },
      });
    }
  );

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
    authMiddleware.checkSuspension,
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

  /**
   * @swagger
   * /api/v2/admin/suspend/{id}:
   *   patch:
   *     summary: Suspend a user account
   *     description: Admin can suspend a user account for a given number of days with a reason.
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Admin
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID of the account to suspend
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               days:
   *                 type: integer
   *                 description: Number of days to suspend the account
   *                 example: 7
   *               reason:
   *                 type: string
   *                 description: Reason for suspension
   *                 example: "Violation of community guidelines"
   *     responses:
   *       200:
   *         description: Account suspended successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 message:
   *                   type: string
   *                   example: Successfully suspend this account for 7
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   *                       description: Updated user object after suspension
   *       400:
   *         description: Suspension days must be a positive number
   *       403:
   *         description: Forbidden (only admin can suspend accounts)
   *       500:
   *         description: Failed to suspend user!
   */

  // 🔹FOR ADMIN ONLY (SUSPEND USER)
  app.patch(
    `${baseUrl}/admin/suspend/:id`,
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    catchAsync(async (req, res, next) => {
      const userId = req.params.id;
      const { days, reason } = req.body;

      if (!userId)
        return next(
          new AppError(
            'User ID is required inorder to suspend that account!',
            400
          )
        );

      const { data } = await service.SuspendAccount({ userId, days, reason });

      res.status(200).json({
        status: 'success',
        message: `Successfully suspend this account for ${days} days`,
        data: {
          user: data,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/admin/unsuspend/{id}:
   *   patch:
   *     summary: Unsuspend a user account
   *     description: Admin can remove suspension from a user account.
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Admin
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID of the account to unsuspend
   *     responses:
   *       200:
   *         description: User unsuspended successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 message:
   *                   type: string
   *                   example: User unsuspended successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       type: object
   *                       description: Updated user object after unsuspension
   *       400:
   *         description: Missing or invalid User ID
   *       401:
   *         description: Unauthorized (missing or invalid token)
   *       403:
   *         description: Forbidden (only admin can unsuspend accounts)
   *       500:
   *         description: Failed to unsuspend user!
   */

  // 🔹FOR ADMIN ONLY (UNSUSPEND USER)
  app.patch(
    `${baseUrl}/admin/unsuspend/:id`,
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    catchAsync(async (req, res, next) => {
      const userId = req.params.id;

      if (!userId) return next(new AppError('Please provide the user ID', 400));

      const { data } = await service.UnsuspendUser({ userId });

      res.status(200).json({
        status: 'success',
        message: 'User unsuspended successfully',
        data: {
          user: data,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/saved-job/{id}:
   *   delete:
   *     summary: Remove a saved job for the authenticated job seeker
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Saved Jobs
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the job to remove from saved list
   *     responses:
   *       204:
   *         description: Saved job removed successfully (no content returned)
   *       404:
   *         description: Job ID not found or invalid
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *       401:
   *         description: Unauthorized — user not logged in or token invalid
   *       403:
   *         description: Forbidden — user not allowed to perform this action
   */

  app.delete(
    `${baseUrl}/saved-job/:id`,
    authMiddleware.protect,
    authMiddleware.restrictTo('job_seeker'),
    isValidObjectId,
    authMiddleware.checkSuspension,
    catchAsync(async (req, res, next) => {
      const jobId = req.params.id;
      const userId = req.user._id;
      if (!jobId) return next(new AppError('Job id not found!', 404));

      const message = await service.RemoveSavedJobs({ jobId, userId });

      res.status(204).json({
        status: 'success',
        message,
      });
    })
  );
};
