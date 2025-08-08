const { upload } = require('../config');
const { JobService } = require('../services');
const { catchAsync, AppError } = require('../utils');
const { authMiddleware, isValidObjectId } = require('./middlewares');

module.exports = (app, channel) => {
  const service = new JobService(channel);
  const baseUrl = process.env.API_BASE_URL_JOB;
  service.RPCObserver(channel);
  service.RPCAuthObserver(channel);

  /**
   * @swagger
   * /api/v2/jobs:
   *   get:
   *     summary: Get all jobs for the logged-in user (with filters, pagination, sorting)
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Job
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Items per page
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *         description: Sort field
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *         description: asc or dsc
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search job by (title, company, location)
   *       - in: query
   *         name: salaryMinPerMonth
   *         schema:
   *           type: string
   *         description: Get job by minimum salary per month
   *       - in: query
   *         name: salaryMaxPerMonth
   *         schema:
   *           type: string
   *         description: Get job by maximum salary per month
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Get job by specific category
   *       - in: query
   *         name: jobType
   *         schema:
   *           type: string
   *         description: Get job by job types (full_time, part_time, remote, internship, contract)
   *       - in: query
   *         name: jobLevel
   *         schema:
   *           type: string
   *         description: Get job by job level (entry_level, mid_level, senior_level, director, vp_or_above)
   *       - in: query
   *         name: latitude
   *         schema:
   *           type: string
   *         description: Latitude for geolocation
   *       - in: query
   *         name: longitude
   *         schema:
   *           type: string
   *         description: Longitude for geolocation
   *       - in: query
   *         name: distance
   *         schema:
   *           type: string
   *         description: Distance for geolocation
   *       - in: query
   *         name: unit
   *         schema:
   *           type: string
   *         description: Unit for geolocation (km, mi)
   *     responses:
   *       200:
   *         description: List of jobs
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 length:
   *                   type: integer
   *                 totalJobs:
   *                   type: integer
   *                 totalPages:
   *                   type: integer
   *                 data:
   *                   type: object
   *                   properties:
   *                     jobs:
   *                       type: array
   *                       items:
   *                         type: object
   */

  // 🔹Get all job for logged in user
  app.get(
    `${baseUrl}`,
    authMiddleware.protect,
    catchAsync(async (req, res) => {
      const query = req.query;
      const { data } = await service.GetAllFilteredJob({ query });
      const { totalJobs, totalPages, jobs } = data;

      if (jobs.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: 'No jobs found!',
          data: { jobs: [] },
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Job fetched successfully!',
        length: jobs.length,
        totalJobs,
        totalPages,
        currentPage: parseInt(query.page) || 1,
        data: {
          jobs,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/jobs/statistics:
   *   get:
   *     summary: Get job, employer, and category statistics (admin only)
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Job
   *     responses:
   *       200:
   *         description: Successfully fetched statistics
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
   *                     employer:
   *                       type: object
   *                     category:
   *                       type: object
   */

  // 🔹Get job statistics
  app.get(
    `${baseUrl}/statistics`,
    authMiddleware.protect,
    // authMiddleware.restrictTo('admin, employer'),
    async (req, res) => {
      const jobStatistics = await service.GetJobStatistics();
      const employerStatistics = await service.GetEmployerStatistics();
      const categoryStatistics = await service.GetCategoryStatistics();
      res.status(200).json({
        status: 'success',
        message: 'Successfully fetched statistics',
        data: {
          job: jobStatistics.data,
          employer: employerStatistics.data,
          category: categoryStatistics.data,
        },
      });
    }
  );

  /**
   * @swagger
   * /api/v2/jobs/{id}/employer-stats:
   *   get:
   *     summary: Get statistics for an employer (jobs, applications, etc.)
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - Job
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: Employer ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Successfully fetched employer statistics
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
   *                   example: Statistics fetched successfully
   *                 data:
   *                   type: object
   *                   properties:
   *                     data:
   *                       type: object
   *                       properties:
   *                         employerId:
   *                           type: string
   *                         summary:
   *                           type: object
   *                           properties:
   *                             totalJobsPosted:
   *                               type: integer
   *                             activeJobs:
   *                               type: integer
   *                             expiredJobs:
   *                               type: integer
   *                             totalApplications:
   *                               type: integer
   *                             averageApplicationsPerJob:
   *                               type: number
   *                         jobTypeStats:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               type:
   *                                 type: string
   *                               count:
   *                                 type: integer
   *                               applications:
   *                                 type: integer
   *                         jobLevelStats:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               level:
   *                                 type: string
   *                               count:
   *                                 type: integer
   *                               applications:
   *                                 type: integer
   *                         categoryStats:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               category:
   *                                 type: string
   *                               count:
   *                                 type: integer
   *                               applications:
   *                                 type: integer
   *                         locationStats:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               location:
   *                                 type: string
   *                               count:
   *                                 type: integer
   *                         timeRangeStats:
   *                           type: object
   *                           properties:
   *                             last7Days:
   *                               type: integer
   *                             last30Days:
   *                               type: integer
   *                             last90Days:
   *                               type: integer
   *       400:
   *         description: Employer ID is required
   *       404:
   *         description: No statistics found
   */

  // 🔹Get Statistics for employer.
  app.get(
    `${baseUrl}/:id/employer-stats`, // Employer ID
    authMiddleware.protect,
    authMiddleware.restrictTo('employer'),
    catchAsync(async (req, res, next) => {
      const employerId = req.params.id;
      if (!employerId) return next(new AppError('Employer id not found!', 400));
      const { data } = await service.StatisticsForEmployer({ employerId });

      res.status(200).json({
        status: 'success',
        message: 'Statistics fetched successfully',
        data: {
          data,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/jobs/{id}/employer:
   *   get:
   *     summary: Get jobs by employer ID
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Job
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Employer ID
   *     responses:
   *       200:
   *         description: Jobs for employer
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
   *                   type: integer
   *                 data:
   *                   type: object
   *                   properties:
   *                     jobs:
   *                       type: array
   *                       items:
   *                         type: object
   */

  // 🔹Get job by employer ID
  app.get(
    `${baseUrl}/:id/employer`,
    authMiddleware.protect,
    authMiddleware.restrictTo('employer', 'admin'),
    isValidObjectId,
    catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const user = req.user;
      if (!id) return next(new AppError('ID not found!', 400));
      const { data } = await service.GetJobByEmployerId({ id, user });
      if (data.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: 'No job found!',
          data: { jobs: [] },
        });
      }
      res.status(200).json({
        status: 'success',
        message: 'Job fetched successfully',
        totalJobs: data.length,
        data: {
          jobs: data,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/jobs/{id}:
   *   get:
   *     summary: Get job by job ID
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Job
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     responses:
   *       200:
   *         description: Job details
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
   */

  // 🔹 Get job by jobID
  app.get(
    `${baseUrl}/:id`,
    authMiddleware.protect,
    isValidObjectId,
    catchAsync(async (req, res, next) => {
      const { id } = req.params;
      if (!id) {
        return next(new AppError('Job ID not found!', 400));
      }
      const { data } = await service.GetSigleJob({ id });
      res.status(200).json({
        status: 'success',
        message: 'Job fetched successfully!',
        data: {
          job: data,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/jobs:
   *   post:
   *     summary: Create a new job
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Job
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *              title:
   *                type: string
   *                description: Job title
   *              company:
   *                type: string
   *                description: Company name
   *              companyLogo:
   *                type: string
   *                format: binary
   *                description: Company logo must be [jpeg, png, jpeg, etc...]
   *              description:
   *                type: string
   *                description: Description and requirement for the job
   *              location:
   *                type: string
   *                description: Static company address
   *              geoLocation:
   *                type: string
   *                description: JSON string, e.g. {"type":"Point","coordinates":[102.0,0.5]} (longitude, latitude) order matter
   *              salaryMinPerMonth:
   *                type: number
   *                description: Minimum salary per month (must be positive number)
   *              salaryMaxPerMonth:
   *                type: number
   *                description: Maximum salary per month (must be positive number)
   *              category:
   *                type: string
   *                description: Choose the category based on the job
   *              jobType:
   *                type: string
   *                description: Job type must be full_time, part_time, remote, internship, contract
   *              jobLevel:
   *                type: string
   *                description: Job level must be entry_level, mid_level, senior_level, director, vp_or_above
   *
   *     responses:
   *       200:
   *         description: Job created successfully
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
   */

  // 🔹Create new job
  app.post(
    `${baseUrl}`,
    authMiddleware.protect,
    upload.single('companyLogo'),
    catchAsync(async (req, res, next) => {
      const reqObj = req.body;
      let file = null;
      if (req.file) {
        file = req.file;
      }

      const { data } = await service.CreateNewJob({
        reqObj,
        file,
        userId: req.user._id,
        user: req.user,
      });
      res.status(200).json({
        status: 'success',
        message: 'Job created successfully!',
        data: {
          job: data,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/jobs/like/{id}:
   *   patch:
   *     summary: Like the job
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Job
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     responses:
   *       201:
   *         description: Job liked successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *       204:
   *          description: No job found with that id
   *       400:
   *          description: User already liked this job
   *       500:
   *          description: Failed to like job
   */

  // 🔹Like job
  app.post(
    `${baseUrl}/like/:id`,
    authMiddleware.protect,
    authMiddleware.restrictTo('job_seeker'),
    catchAsync(async (req, res, next) => {
      const userId = req.user._id;
      const jobId = req.params.id;
      if (!jobId) return next(new AppError('Job id not found!', 400));

      const { data } = await service.AddLike({ userId, jobId });

      res.status(200).json({
        status: 'success',
        message: data,
      });
    })
  );

  /**
   * @swagger
   * /api/v2/jobs/{id}/renew:
   *   patch:
   *     summary: Renew job expiration (employer or admin)
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Job
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     responses:
   *       201:
   *         description: Job expiration extended
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
   *                     renewedJob:
   *                       type: object
   */

  // 🔹Renew job
  app.patch(
    `${baseUrl}/:id/renew`,
    authMiddleware.protect,
    authMiddleware.restrictTo('employer', 'admin'),
    isValidObjectId,
    catchAsync(async (req, res, next) => {
      const { id } = req.params;

      if (!id) {
        return next(new AppError('ID not found!', 400));
      }

      const { data } = await service.renewJobExpiration({ id });

      res.status(201).json({
        status: 'success',
        message:
          'Job expiration extended by 30 days! and the job status remains open',
        data: {
          renewedJob: data,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/jobs/{id}/like:
   *   patch:
   *     summary: Remove like for logged in job seekers
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Job
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     responses:
   *      201:
   *         description: Like removed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *      400:
   *        description: Job id not found!, You can't remove like! Since you are not liked this job
   *      404:
   *        description: No job found with that id
   *      500:
   *        description: Failed to remove like
   *
   */

  app.patch(
    `${baseUrl}/:id/like`,
    authMiddleware.protect,
    authMiddleware.restrictTo('job_seeker'),
    catchAsync(async (req, res, next) => {
      const userId = req.user._id;
      const jobId = req.params.id;
      if (!jobId) return next(new AppError('Job id not found!', 400));
      const { data } = await service.RemoveLike({ userId, jobId });
      res.status(200).json({
        status: 'success',
        message: data,
      });
    })
  );

  /**
   * @swagger
   * /api/v2/jobs/{id}/close:
   *   patch:
   *     summary: Close job (employer or admin)
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Job
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     responses:
   *       201:
   *         description: Job closed successfully
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
   *                     closedJob:
   *                       type: object
   */

  // 🔹Close job
  app.patch(
    `${baseUrl}/:id/close`,
    authMiddleware.protect,
    authMiddleware.restrictTo('employer', 'admin'),
    isValidObjectId,
    catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const user = req.user;
      if (!id) return next(new AppError('ID not found!', 400));
      const { data } = await service.CloseJob({ id, user });

      res.status(201).json({
        status: 'success',
        message: 'Job successfully closed!',
        data: {
          closedJob: data,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/jobs/{id}:
   *   patch:
   *     summary: Update job details (employer or admin)
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Job
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *              title:
   *                type: string
   *                description: Job title
   *              company:
   *                type: string
   *                description: Company name
   *              companyLogo:
   *                type: string
   *                format: binary
   *                description: Company logo must be [jpeg, png, jpeg, etc...]
   *              description:
   *                type: string
   *                description: Description and requirement for the job
   *              location:
   *                type: string
   *                description: Static company address
   *              geoLocation:
   *                type: string
   *                description: JSON string, e.g. {"type":"Point","coordinates":[102.0,0.5]} (longitude, latitude) order matter
   *              salaryMinPerMonth:
   *                type: number
   *                description: Minimum salary per month (must be positive number)
   *              salaryMaxPerMonth:
   *                type: number
   *                description: Maximum salary per month (must be positive number)
   *              category:
   *                type: string
   *                description: Choose the category based on the job
   *              jobType:
   *                type: string
   *                description: Job type must be full_time, part_time, remote, internship, contract
   *              jobLevel:
   *                type: string
   *                description: Job level must be entry_level, mid_level, senior_level, director, vp_or_above
   *     responses:
   *       201:
   *         description: Job updated successfully
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
   *                     updatedJob:
   *                       type: object
   */

  // 🔹Update job details
  app.patch(
    `${baseUrl}/:id`,
    authMiddleware.protect,
    authMiddleware.restrictTo('employer', 'admin'),
    isValidObjectId,
    upload.single('companyLogo'),
    catchAsync(async (req, res, next) => {
      let file = null;
      const { id } = req.params;
      const currentUser = req.user;
      const reqObj = req.body;

      if (!id) {
        return next(new AppError('Job ID not found!', 400));
      }
      if (req.file) file = req.file;

      const { data } = await service.UpdateJob({
        id,
        file,
        reqObj,
        currentUser,
      });

      res.status(201).json({
        status: 'success',
        message: 'Job updated successfully!',
        data: {
          updatedJob: data,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/jobs/{id}:
   *   delete:
   *     summary: Delete job by ID (employer or admin)
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Job
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Job ID
   *     responses:
   *       200:
   *         description: Job deleted successfully
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

  // 🔹Delete job by ID
  app.delete(
    `${baseUrl}/:id`,
    authMiddleware.protect,
    authMiddleware.restrictTo('employer', 'admin'),
    isValidObjectId,
    catchAsync(async (req, res, next) => {
      const { id } = req.params;
      if (!id) return next(new AppError('ID not found!', 400));
      const { data } = await service.DeleteJobById({ id, user: req.user });

      res.status(200).json({
        status: 'success',
        message: data,
      });
    })
  );
};
