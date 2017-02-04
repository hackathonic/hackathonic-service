const epilogue = require('epilogue');
const models = require('../models');

const projectResource = epilogue.resource({
  model: models.Project,
  endpoints: ['/project', '/project/:id']
});

module.exports = projectResource;
