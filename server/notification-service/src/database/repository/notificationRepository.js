const { Notification } = require('../models');
const { AppError } = require('../../utils');

class NotificationRepository {
  async GetAllNotification(input) {
    const { id } = input;
    try {
      const notification = await Notification.find({ userId: id });
      return notification;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async GetNotificationById(input) {
    const { id } = input;
    try {
      const notification = await Notification.findById(id);
      return notification;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async DeleteNotification(input) {
    const { id } = input;
    try {
      const notification = await Notification.findOneAndDelete({ _id: id });
      return notification;
    } catch (err) {
      throw new Error(err.message, err.statusCode);
    }
  }

  async ReadNotification(input) {
    const { id } = input;
    try {
      const notification = await Notification.findByIdAndUpdate(id, {
        status: 'read',
      });
      return notification;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async CreateNotification(input) {
    const { userId, message } = input;
    try {
      const notification = await Notification.create({
        userId,
        message,
      });
      if (!notification) return false;
      return notification;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }
}

module.exports = NotificationRepository;
