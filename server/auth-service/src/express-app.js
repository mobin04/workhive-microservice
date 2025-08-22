const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('./database/repository/suspensionCleaner');
const { auth } = require('./api');
const { swaggerSpec, swaggerUI } = require('./swagger');
const {
  errorHandling: globalErrorHandling,
} = require('./api/middlewares/index');

module.exports = async (app, channel) => {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );
  app.use(cookieParser());

  app.use(
    '/api/v2/auth/api-docs',
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec)
  );

  auth(app, channel);

  app.use(globalErrorHandling);
};
