const express = require('express');
const cookieParser = require('cookie-parser');
const application = require('./api/application');
const { swaggerSpec, swaggerUI } = require('./swagger');

const {
  errorHandling: globalErrorHandling,
} = require('./api/middlewares/index');

module.exports = async (app) => {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  app.use(
    '/api/v2/applications/api-docs',
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec)
  );

  application(app);

  app.use(globalErrorHandling);
};
