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
    jobTitle: { type: String },
    company: { type: String },
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
