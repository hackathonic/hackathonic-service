const epilogue = require('epilogue');
const models = require('../models');
const ForbiddenError = epilogue.Errors.ForbiddenError;

const teamAccess = (req, res, context) => {
  if (!req.isAuthenticated()) {
    throw new ForbiddenError();
  }
  return context.continue;
};

const teamResource = epilogue.resource({
  model: models.Team,
  endpoints: ['/team', '/team/:id']
});

teamResource.create.auth(teamAccess);
teamResource.delete.auth(teamAccess);
teamResource.update.auth(teamAccess);

module.exports = teamResource;
