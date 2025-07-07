const express = require('express');
const http = require('http');
const { databaseConnection } = require('./database/index');
const expressApp = require('./express-app');
const { initSocket } = require('./config/socket');

require('dotenv').config();

const StartServer = async () => {
 
  const app = express();

  await databaseConnection();

  await expressApp(app);

  const server = http.createServer(app);

  initSocket(server);

  const PORT = process.env.PORT_APPLICATION;

  server
    .listen(PORT, () => {
      console.log(`✅ Application listening on port: ${PORT} :)`);
    })
    .on('error', (err) => {
      console.log(err);
      process.exit();
    });
};

StartServer();
