const express = require('express');
const http = require('http');
const { databaseConnection } = require('./database/index');
const expressApp = require('./express-app');
const { initSocket } = require('./config/socket');
const rabbitMq = require('./rabbitMq/rabbitMqConnection')

require('dotenv').config();

const StartServer = async () => {
  const app = express();

  await databaseConnection();

  const channel = await rabbitMq.connect();
  
  await expressApp(app, channel);

  const server = http.createServer(app);

  initSocket(server);

  const PORT = process.env.PORT;

  server
    .listen(PORT, () => {
      console.log(
        `✅ Notification is listening on port: ${PORT}`
      );
    })
    .on('error', (err) => {
      console.log(err);
      process.exit();
    });
};

StartServer();
