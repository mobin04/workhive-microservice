const { Notification } = require('../models');
const { AppError } = require('../../utils');

class NotificationRepository {
  async GetAllNotification(input) {
    const { id } = input;
    try {
      const notification = await Notification.find({ userId: id }).sort({
        createdAt: -1,
      });
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
      if (!notification) return false;

      return true;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async ReadAllNotification(input) {
    const { userId } = input;
    try {
      const notification = await Notification.updateMany(
        { userId, status: 'unread' },
        { $set: { status: 'read' } }
      );
      if (!notification) return false;
      return true;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }

  async CreateNotification(input) {
    const { userId, message, jobDetails } = input;
    console.log(jobDetails);
    try {
      const notification = await Notification.create({
        userId,
        message,
        jobTitle: jobDetails.title,
        company: jobDetails.company,
      });
      if (!notification) return false;
      return notification;
    } catch (err) {
      throw new AppError(err.message, err.statusCode);
    }
  }
}

module.exports = NotificationRepository;
