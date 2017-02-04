require('dotenv').config({
  path: `${__dirname}/.env`
});

const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const sequelize = require('./sequelize');
const epilogue = require('epilogue');

const {
  APP_PORT,
  APP_HOST
} = process.env;

const app = express();

app.set('port', APP_PORT);
app.set('host', APP_HOST);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const server = http.createServer(app);

// Initialize epilogue
epilogue.initialize({ app, sequelize });

// Create REST resource
require('./resources/hackathon');
require('./resources/project');
require('./resources/team');
require('./resources/person');

// Create database and listen
sequelize
  .sync({ force: true })
  .then(() => {
    server.listen(app.get('port'), app.get('host'), () => {
      const host = app.get('host');
      const port = app.get('port');
      console.info(`Server listening on http://${host}:${port}`);
    });
  });
