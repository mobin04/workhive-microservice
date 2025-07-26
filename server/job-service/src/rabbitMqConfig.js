const dotEnv = require('dotenv');

dotEnv.config();

module.exports = {
  MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
  EXCHANGE_NAME: 'application.exchange',
  AUTH_EXCHANGE: 'exchange.job',
  QUEUE: 'job-request-queue',
  AUTH_BINDING_KEY: 'auth_job_request',
  AUTH_QUEUE: 'job-request-queue-auth',
  BINDING_KEY: 'job_request',
};
