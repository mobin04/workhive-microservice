const express = require('express');
const cookieParser = require('cookie-parser');
const { notification } = require('./api');
const { swaggerSpec, swaggerUI } = require('./swagger');
const {
  errorHandling: globalErrorHandling,
} = require('./api/middlewares/index');

module.exports = async (app, channel) => {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  app.use(
    '/api/v2/notifications/api-docs',
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec)
  );

  notification(app, channel);

  app.use(globalErrorHandling);
};
