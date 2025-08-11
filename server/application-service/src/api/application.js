const { ApplicationService } = require('../services');
const { catchAsync, AppError } = require('../utils');
const { authMiddleware, isValidObjectId } = require('./middlewares');
const ProvideMessage = require('../rabbitMQ/rabbitMqProvider');
const { upload } = require('../config');

module.exports = (app) => {
  const service = new ApplicationService();
  const baseUrl = process.env.API_BASE_URL_APPLICATION;

  /**
   * @swagger
   * /api/v1/application/{id}/withdrawn:
   *   get:
   *     summary: Get all withdrawn job applications for a specific user
   *     tags:
   *       - Applications
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number for pagination
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of applications per page
   *     responses:
   *       200:
   *         description: Withdrawn applications fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 totalApplication:
   *                   type: integer
   *                 data:
   *                   type: object
   *                   properties:
   *                     applications:
   *                       type: array
   *                       items:
   *                         type: object
   *       403:
   *         description: Forbidden - user not authorized
   *       500:
   *         description: Internal server error
   */

  // 🔹Get withdrawned application
  app.get(
    `${baseUrl}/:id/withdrawn`,
    authMiddleware.protect,
    authMiddleware.restrictTo('admin', 'job_seeker'),
    async (req, res, next) => {
      const reqQuery = req.query;
      const applicantId = req.params.id;

      try {
        const { data } = await service.GetWithdrawnedApplication({
          reqQuery,
          applicantId,
        });
        if (data.length === 0) {
          return res.status(200).json({
            status: 'success',
            message: 'No withdrawned application found!',
            data: { applications: [] },
          });
        }

        res.status(200).json({
          status: 'success',
          message: 'Withdrawn applications fetched successfully!',
          totalApplication: data.applicationInfo.length,
          // currentPage: parseInt(req.query.page) || 1,
          // totalPages: Math.ceil(
          //   data.applicationCount / (req.query.limit || 10)
          // ),
          data: {
            application: data.applicationInfo,
          },
        });
      } catch (err) {
        return next(
          new AppError(`Something went wrong: ${err.message}`, err.statusCode)
        );
      }
    }
  );

  /**
   * @swagger
   * /api/v2/application/{id}/job:
   *   get:
   *     summary: Get applications by job ID (employer or admin)
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Application
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     responses:
   *       200:
   *         description: Successfully fetched applications
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
   *                     totalApplication:
   *                       type: integer
   *                     application:
   *                       type: array
   *                       items:
   *                         type: object
   */

  // 🔹Get applications by jobID
  app.get(
    `${baseUrl}/:id/job`,
    authMiddleware.protect,
    authMiddleware.restrictTo('employer', 'admin'),
    isValidObjectId,
    catchAsync(async (req, res, next) => {
      const jobId = req.params.id;
      const currentUser = req.user;
      const reqQuery = req.query;

      const { data } = await service.GetApplicationByJobId({
        jobId,
        currentUser,
        reqQuery,
      });

      res.status(200).json({
        status: 'success',
        message: 'successfully fetched applications!',
        data: data,
      });
    })
  );

  app.get(
    `${baseUrl}/:id/application`,
    authMiddleware.protect,
    authMiddleware.restrictTo('employer', 'admin'),
    isValidObjectId,
    catchAsync(async (req, res, next) => {
      const appId = req.params.id;
      if (!appId)
        return next(
          new AppError(
            'Application id is required in order to find application',
            400
          )
        );

      const { data } = await service.GetAppByAppId({ appId });
      return res.status(200).json({
        status: 'success',
        message: 'Application fetched successfully!',
        data,
      });
    })
  );

  /**
   * @swagger
   * /api/v2/application/{id}:
   *   get:
   *     summary: Get application by applicant ID
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Application
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Applicant ID
   *     responses:
   *       200:
   *         description: Application fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 totalApplication:
   *                   type: integer
   *                 data:
   *                   type: object
   *                   properties:
   *                     application:
   *                       type: array
   *                       items:
   *                         type: object
   *
   *
   */

  // 🔹Get application by applicant ID
  app.get(
    `${baseUrl}/:id`,
    authMiddleware.protect,
    isValidObjectId,
    catchAsync(async (req, res, next) => {
      const { id } = req.params;

      if (!id) return next(new AppError('ID not found!', 400));

      const { data } = await service.GetApplicationByApplicantId({ id });

      if (data.countApplication === 0) {
        return res.status(200).json({
          status: 'success',
          message: 'No applications found!',
          data: { application: [] },
        });
      }

      const routing_key = 'job_request';
      let finalOutput = [];

      // Bind job details and application details together
      finalOutput = await Promise.all(
        data.application.map(async (application) => {
          const applicationDetail = { application, job: null };
          applicationDetail.job = await ProvideMessage(
            { id: application._id, type: 'applicationId' },
            routing_key,
            10000
          );
          return applicationDetail;
        })
      );

      res.status(200).json({
        status: 'success',
        message: 'Application fetched successfully!',
        totalApplication: finalOutput.length,
        data: {
          application: finalOutput,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/application:
   *   post:
   *     summary: Apply for a job (create application)
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Application
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               job:
   *                 type: string
   *                 description: Job ID
   *               resume:
   *                 type: string
   *                 format: binary
   *                 description: Resume file (jpg, png, jpeg, etc.)
   *     responses:
   *       200:
   *         description: Successfully created application
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
   *                     application:
   *                       type: object
   */

  // 🔹apply new application.
  app.post(
    `${baseUrl}`,
    authMiddleware.protect,
    upload.single('resume'),
    catchAsync(async (req, res, next) => {
      const jobId = req.body.job;
      const userId = req.user._id;
      const file = req.file;
      const currentUser = req.user;
      const { data } = await service.CreateApplication({
        jobId,
        userId,
        file,
        currentUser,
      });

      const application = data;
      res.status(200).json({
        status: 'success',
        message: 'Successfully created application!',
        data: application,
      });
    })
  );

  /**
   * @swagger
   * /api/v2/application/{id}/withdraw:
   *   patch:
   *     summary: Withdraw an application
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Application
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Application ID
   *     responses:
   *       200:
   *         description: Application withdrawn successfully
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
   *                     application:
   *                       type: object
   */

  // 🔹Withdraw application.
  app.patch(
    `${baseUrl}/:id/withdraw`,
    authMiddleware.protect,
    isValidObjectId,
    catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const currentUserId = req.user._id;
      if (!id) return next(new AppError('Application ID not found!', 400));

      const { data } = await service.WithdrawApplication({ id, currentUserId });

      res.status(200).json({
        status: 'success',
        message: 'Application withdrawned successfully!',
        data: {
          application: data,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/application/status/{id}:
   *   patch:
   *     summary: Update application status (accept/reject)
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Application
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Application ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [accepted, rejected]
   *                 description: New status for the application
   *     responses:
   *       200:
   *         description: Successfully updated application status
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
   *                     application:
   *                       type: object
   *                       properties:
   *                         _id:
   *                           type: string
   *                         status:
   *                           type: string
   *                         applicant:
   *                           type: object
   */

  // 🔹Update application status
  app.patch(
    `${baseUrl}/status/:id`,
    authMiddleware.protect,
    authMiddleware.restrictTo('employer', 'admin'),
    isValidObjectId,
    catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const { status } = req.body;
      const currentUser = req.user;

      if (!id) return next(new AppError('Application ID not found!', 400));

      if (!status)
        return next(
          new AppError(
            `Not found status info! Status must be 'accepted' or 'rejected'`,
            400
          )
        );

      const { data } = await service.UpdateApplicationStatus({
        id,
        status,
        currentUser,
      });

      res.status(200).json({
        status: 'success',
        message: 'Successfully updated application status!',
        data: {
          application: {
            ...data.updatedApplication,
            applicant: data.applicant,
          },
        },
      });
    })
  );
};
