const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: [true, 'notification must have a message!'],
    },
    status: {
      type: String,
      enum: {
        values: ['read', 'unread'],
        message: 'notification status must be read or unread!',
      },
      default: 'unread',
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
