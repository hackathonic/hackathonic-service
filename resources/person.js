const epilogue = require('epilogue');
const models = require('../models');
const ForbiddenError = epilogue.Errors.ForbiddenError;

const personAccess = (req, res, context) => {
  if (!req.isAuthenticated()) {
    throw new ForbiddenError();
  }
  return context.continue;
};

const personResource = epilogue.resource({
  model: models.Person,
  endpoints: ['/person', '/person/:id'],
  actions: ['list', 'read', 'delete'],
  excludeAttributes: [
    'githubId'
  ]
});

personResource.delete.auth(personAccess);

module.exports = personResource;
