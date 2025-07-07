const dotEnv = require('dotenv');

dotEnv.config();

module.exports = {
  MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
  EXCHANGE_NAME: 'application.exchange',
  QUEUE: 'user.request.queue',
  BINDING_KEY: 'user.request',
};
