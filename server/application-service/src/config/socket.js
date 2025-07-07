const socketIo = require('socket.io');
const ProvideMessage = require('../rabbitMQ/rabbitMqProvider');
const routing_key_notification = 'notification_create_request';

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
    const notification = await ProvideMessage(
      { type: 'notificationCreate', userId, message },
      routing_key_notification,
      10000
    );
 
    if (notification) {
      io.emit(`notification:${userId}`, {
        id: notification._id,
        message,
        timeStamp: new Date(),
      });
    }
  }
};

const notifyEmployer = async (employerId, jobTitle) => {
  const message = `A new application was submitted for your job: ${jobTitle}`;

  if (io) {
    const notification = await ProvideMessage(
      { type: 'notificationCreate', userId: employerId, message},
      routing_key_notification,
      10000
    );

    io.emit(`notification:${employerId}`, {
      id: notification._id,
      message,
      timeStamp: new Date(),
    });
  }
};

module.exports = { initSocket, notifyApplicant, notifyEmployer };
