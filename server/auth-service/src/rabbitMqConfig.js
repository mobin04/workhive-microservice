const dotEnv = require('dotenv');

dotEnv.config();

module.exports = {
  MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
  EXCHANGE_NAME: 'application.exchange',
  AUTH_EXCHANGE: 'exchange.job',
  AUTH_ROUTING_KEY: 'auth_job_request',
  QUEUE: 'user.request.queue',
  BINDING_KEY: 'user.request',
};
