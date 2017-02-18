const epilogue = require('epilogue');
const { handleResourceAccess } = require('../lib/authentication');
const models = require('../models');
const CONSTS = require('../consts');

const BadRequestError = epilogue.Errors.BadRequestError;

const STAGES = Object.keys(CONSTS)
                     .filter(key => /STAGE/.test(key))
                     .map(key => CONSTS[key]);

const isStageValid = stage => STAGES.indexOf(stage) !== -1;

const hackathonResource = epilogue.resource({
  model: models.Hackathon,
  endpoints: ['/hackathon', '/hackathon/:id']
});

hackathonResource.update.start((req, res, context) => {
  if (req.body.stage !== undefined && !isStageValid(req.body.stage)) {
    throw new BadRequestError(`Invalid stage value. Should be one of: ${STAGES.join(', ')}`);
  }
  return context.continue;
});

hackathonResource.create.auth(handleResourceAccess);
hackathonResource.delete.auth(handleResourceAccess);
hackathonResource.update.auth(handleResourceAccess);
hackathonResource.create.auth.after((req, res, context) => {
  const { githubId } = req.user;
  return models.Person.findAll({
    where: { githubId },
    limit: 1
  })
  .then(persons => persons[0])
  .then(person => {
    if (!person) {
      return context.error(400, 'Hackathon can be created only by registered person');
    }
    req.body.ownerId = person.get('id');
    return context.continue;
  });
});

module.exports = hackathonResource;
