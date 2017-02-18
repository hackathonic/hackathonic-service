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

const injectOwnerId = (req, res, context) => {
  return models.Person.findByGithubId(req.user.githubId).then(person => {
    if (!person) {
      return context.error(400, 'Hackathon can be created only by registered person');
    }
    req.body.ownerId = person.get('id');
    return context.continue;
  });
};

const onlyOwnerAccess = (req, res, context) => {
  return models.Person.findByGithubId(req.user.githubId)
    .then(person => {
      return models.Hackathon
        .findByOwnerId(person.get('id'))
        .then(hackathon => {
          if (!hackathon || hackathon.get('id') !== req.params.id) {
            return context.error(400, 'Only owner can modify a Hackathon');
          }
          return context.continue;
        });
    });
};

hackathonResource.create.auth(handleResourceAccess);
hackathonResource.delete.auth(handleResourceAccess);
hackathonResource.update.auth(handleResourceAccess);

hackathonResource.update.auth.after(onlyOwnerAccess);
hackathonResource.delete.auth.after(onlyOwnerAccess);
hackathonResource.create.auth.after(injectOwnerId);

module.exports = hackathonResource;
