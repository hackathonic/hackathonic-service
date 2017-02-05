const epilogue = require('epilogue');
const models = require('../models');
const ForbiddenError = epilogue.Errors.ForbiddenError;

const projectAccess = (req, res, context) => {
  if (!req.isAuthenticated()) {
    throw new ForbiddenError();
  }
  return context.continue;
};

const projectResource = epilogue.resource({
  model: models.Project,
  endpoints: ['/project', '/project/:id']
});

projectResource.create.auth(projectAccess);
projectResource.delete.auth(projectAccess);
projectResource.update.auth(projectAccess);

module.exports = projectResource;
