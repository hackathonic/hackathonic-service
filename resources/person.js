const epilogue = require('epilogue');
const models = require('../models');

const personResource = epilogue.resource({
  model: models.Person,
  endpoints: ['/person', '/person/:id']
});

module.exports = personResource;
