const epilogue = require('epilogue');
const models = require('../models');
const CONSTS = require('../consts');

const BadRequestError = epilogue.Errors.BadRequestError;
const ForbiddenError = epilogue.Errors.ForbiddenError;

const STAGES = Object.keys(CONSTS)
                     .filter(key => /STAGE/.test(key))
                     .map(key => CONSTS[key]);

const isStageValid = stage => STAGES.indexOf(stage) !== -1;

const hackathonAccess = (req, res, context) => {
  if (!req.isAuthenticated()) {
    throw new ForbiddenError();
  }
  return context.continue;
};

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

hackathonResource.create.auth(hackathonAccess);
hackathonResource.delete.auth(hackathonAccess);
hackathonResource.update.auth(hackathonAccess);

module.exports = hackathonResource;
