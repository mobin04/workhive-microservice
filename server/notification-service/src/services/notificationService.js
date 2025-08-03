const { NotificationRepository } = require('../database/repository');
const { AppError, formatData } = require('../utils');
const { EXCHANGE_NAME, QUEUE, BINDING_KEY } = require('../rabbitMqConfig');

class NotificationService {
  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async GetAllNotification(userInput) {
    const { id } = userInput; // id => User id
    try {
      const notification = await this.notificationRepository.GetAllNotification(
        { id }
      );
      return formatData(notification);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async DeleteNotification(userInput) {
    const { id, userId } = userInput; // id => Notification ID
    try {
      const getNotification =
        await this.notificationRepository.GetNotificationById({ id });

      if (!getNotification || getNotification.length === 0) {
        throw new AppError('No notification found with that ID');
      }

      if (userId.toString() !== getNotification.userId.toString())
        throw new AppError(
          'You are not allowed to deleted this notification',
          403
        );

      const notification = await this.notificationRepository.DeleteNotification(
        { id }
      );

      if (!notification) {
        throw new AppError('Notification not found!');
      }
      return formatData(notification);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async ReadAllNotificatiton(userInput) {
    const { userId } = userInput;
    try {
      const updatedNotification =
        await this.notificationRepository.ReadAllNotification({ userId });

      if (!updatedNotification)
        throw new AppError('Failed to update notification!', 500);

      const allNotification =
        await this.notificationRepository.GetAllNotification({ id: userId });

      if (!allNotification)
        throw new AppError('Falied to fetch all notifications', 500);

      return formatData(allNotification);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async ReadNotification(userInput) {
    const { notifId, userId } = userInput;
    try {
      const notification = await this.notificationRepository.ReadNotification({
        id: notifId,
      });

      if (!notification)
        throw new AppError('Failed to update notification', 500);
      
      const allNotification =
        await this.notificationRepository.GetAllNotification({ id: userId });
        
      if (!allNotification)
        throw new AppError('Failed to fetch all notifications', 500);

      return formatData(allNotification);
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async RPCObserver(channel) {
    try {
      await channel.assertQueue(QUEUE, { durable: true });
      channel.bindQueue(QUEUE, EXCHANGE_NAME, BINDING_KEY);

      channel.consume(QUEUE, async (msg) => {
        let notification = null;
        if (msg !== null) {
          const content = JSON.parse(msg.content.toString());
          const { type } = content;

          if (type === 'notificationCreate') {
            const { userId, message, jobDetails } = content;
            notification = await this.notificationRepository.CreateNotification(
              { userId, message, jobDetails }
            );
          }
        }

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(notification)),
          {
            correlationId: msg.properties.correlationId,
          }
        );

        channel.ack(msg);
      });
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }
}

module.exports = NotificationService;
