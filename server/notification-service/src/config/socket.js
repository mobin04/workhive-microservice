const socketIo = require('socket.io');
const Notification = require('../database/models/notificationModel')

let io;

const initSocket = (server) => {
  io = socketIo(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('disconnect', (socket) => {
      console.log(`User disconnected : ${socket.id}`);
    });
  });
  return io;
};

const notifyApplicant = async (userId, status) => {
  const message = `Your application has been ${status}`;

  if (io) {
    const notification = await Notification.create({ userId, message });
    io.emit(`notification:${userId}`, { id: notification._id, message, timeStamp: new Date() });
  }
};

const notifyEmployer = async (employerId, jobTitle) => {
  const message = `A new application was submitted for your job: ${jobTitle}`;
  if (io) {
    const notification = await Notification.create({ userId: employerId, message });

    io.emit(`notification:${employerId}`, { id: notification._id, message, timeStamp: new Date() });
  }
};

module.exports = { initSocket, notifyApplicant, notifyEmployer };
