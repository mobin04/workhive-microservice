require('dotenv').config();

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WorkHive Job Service API',
      version: '2.0.0',
      description: 'API documentation for the Job Microservice',
    },
    servers: [
      {
        url: process.env.SWAGGER_URL_JOB || 'http://localhost/api/v2/jobs',
      },
    ],
  },
  apis: ['./src/api/*.js'],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUI, swaggerSpec };
