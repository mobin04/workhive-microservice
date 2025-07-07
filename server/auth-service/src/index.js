const express = require('express');
const http = require('http');
const { databaseConnection } = require('./database/index');
const RabbitMQ = require('./rabbitMqConnection/rabbitMQ')
const expressApp = require('./express-app');

require('dotenv').config();

const StartServer = async () => {
  const app = express();

  await databaseConnection();

  const channel = await RabbitMQ.connect();
  
  await expressApp(app, channel);

  const server = http.createServer(app);

  const PORT = process.env.PORT_AUTH;

  server
    .listen(PORT, () => {
      console.log(`✅ Authentication is listening on port: ${PORT}`);
    })
    .on('error', (err) => {
      console.log(err);
      process.exit();
    });
};

StartServer();
