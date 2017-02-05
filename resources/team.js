const epilogue = require('epilogue');
const { handleResourceAccess } = require('../lib/authentication');
const models = require('../models');

const teamResource = epilogue.resource({
  model: models.Team,
  endpoints: ['/team', '/team/:id']
});

teamResource.create.auth(handleResourceAccess);
teamResource.delete.auth(handleResourceAccess);
teamResource.update.auth(handleResourceAccess);

module.exports = teamResource;
