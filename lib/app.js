const express = require('express');
const bodyParser = require('body-parser');
const epilogue = require('epilogue');
const database = require('./database');

const {
  PORT,
  HOST
} = process.env;

const base = '/api/v1';
const app = express();

app.set('port', PORT);
app.set('host', HOST);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize epilogue
epilogue.initialize({ app, sequelize: database, base });

// Create REST resource
require('../resources/hackathon');
require('../resources/project');
require('../resources/team');
require('../resources/person');
require('../resources/vote');

module.exports = app;
