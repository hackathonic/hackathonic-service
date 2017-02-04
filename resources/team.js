const epilogue = require('epilogue');
const models = require('../models');

const teamResource = epilogue.resource({
  model: models.Team,
  endpoints: ['/team', '/team/:id']
});

module.exports = teamResource;
