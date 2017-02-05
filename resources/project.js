const epilogue = require('epilogue');
const { handleResourceAccess } = require('../lib/authentication');
const models = require('../models');

const projectResource = epilogue.resource({
  model: models.Project,
  endpoints: ['/project', '/project/:id']
});

projectResource.create.auth(handleResourceAccess);
projectResource.delete.auth(handleResourceAccess);
projectResource.update.auth(handleResourceAccess);

module.exports = projectResource;
