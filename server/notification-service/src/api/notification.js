const { catchAsync, AppError } = require('../utils');
const { NotificationService } = require('../services');
const { authMiddleware, isValidObjectId } = require('./middlewares');

module.exports = (app, channel) => {
  const baseUrl = process.env.API_BASE_URL_NOTIFICATION;
  const service = new NotificationService();
  service.RPCObserver(channel);

  app.get(`${baseUrl}/health`, (req, res) => {
    res.status(200).send('Notification service working Fine 🕊️');
  });

  /**
   * @swagger
   * /api/v2/notifications:
   *   get:
   *     summary: Get all notifications for the logged-in user
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Notification
   *     responses:
   *       200:
   *         description: Successfully fetched notifications
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   *                 totalNotifications:
   *                   type: integer
   *                 data:
   *                   type: object
   *                   properties:
   *                     notification:
   *                       type: array
   *                       items:
   *                         type: object
   */

  app.get(
    `${baseUrl}`,
    authMiddleware.protect,
    catchAsync(async (req, res, next) => {
      const id = req.user._id;
      if (!id) return next(new AppError('ID not found!', 404));
      const { data } = await service.GetAllNotification({ id });
      if (data.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: 'No notification found!',
          data: { notifications: [] },
        });
      }

      res.status(200).json({
        status: 'success',
        message: 'Successfully fetched notifications!',
        totalNotifications: data.length,
        data: {
          notification: data,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/notifications/read-all:
   *   patch:
   *     summary: Read all notification for logged in user
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Notification
   *     responses:
   *       200:
   *         description: All notifications are successfully read
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
   *                     notification:
   *                       type: array
   *                       items:
   *                         type: object
   *       500:
   *          description: Failed to update notification
   */

  app.patch(
    `${baseUrl}/read-all`,
    authMiddleware.protect,
    catchAsync(async (req, res, next) => {
      const userId = req.user._id;
      if (!userId) return next(new AppError('Failed to fetch user id', 500));

      const { data } = await service.ReadAllNotificatiton({ userId });

      res.status(200).json({
        status: 'success',
        message: 'All notifications are successfully read',
        data: {
          notification: data,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/notifications/read/{id}:
   *   patch:
   *     summary: Read notification based on the notification ID for logged in user
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Notification
   *     responses:
   *       200:
   *         description: Notification read successfully
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
   *                     notification:
   *                       type: array
   *                       items:
   *                         type: object
   *       500:
   *          description: Failed to update notification
   */

  app.patch(
    `${baseUrl}/read/:id`,
    authMiddleware.protect,
    catchAsync(async (req, res, next) => {
      const { notifId } = req.params;
      const { userId } = req.user._id;
      if (!notifId)
        return next(new AppError('Notification id is not found!', 404));

      const notification = await service.ReadNotification({ notifId, userId });

      res.status(200).json({
        status: 'success',
        message: 'Notification read successfully',
        data: {
          notification,
        },
      });
    })
  );

  /**
   * @swagger
   * /api/v2/notifications/{id}:
   *   delete:
   *     summary: Delete a notification by ID
   *     security:
   *       - bearerAuth: []
   *       - jwt: []
   *     tags:
   *       - Notification
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Notification ID
   *     responses:
   *       200:
   *         description: Notification successfully deleted
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
   *                     deletedNotification:
   *                       type: object
   */

  app.delete(
    `${baseUrl}/:id`,
    authMiddleware.protect,
    isValidObjectId,
    catchAsync(async (req, res, next) => {
      const { id } = req.params;
      const userId = req.user._id;
      if (!id) return next(new AppError('ID not found!', 400));
      const { data } = await service.DeleteNotification({ id, userId });
      res.status(200).json({
        status: 'success',
        message: 'Notification successfully deleted!',
        data: {
          deletedNotification: data,
        },
      });
    })
  );
};
