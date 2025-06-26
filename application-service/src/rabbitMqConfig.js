const dotEnv = require('dotenv');

dotEnv.config();

module.exports = {
  MESSAGE_BROKER_URL: process.env.MESSAGE_BROKER_URL,
  application_exchange: 'application.exchange',
};
