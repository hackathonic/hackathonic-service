const epilogue = require('epilogue');
const models = require('../models');

const hackathonResource = epilogue.resource({
  model: models.Hackathon,
  endpoints: ['/hackathon', '/hackathon/:id']
});

module.exports = hackathonResource;
