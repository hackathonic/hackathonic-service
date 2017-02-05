const epilogue = require('epilogue');
const { handleResourceAccess } = require('../lib/authentication');
const models = require('../models');

const personResource = epilogue.resource({
  model: models.Person,
  endpoints: ['/person', '/person/:id'],
  excludeAttributes: [
    'githubId'
  ]
});

personResource.create.auth(handleResourceAccess);
personResource.update.auth(handleResourceAccess);
personResource.delete.auth(handleResourceAccess);

module.exports = personResource;
