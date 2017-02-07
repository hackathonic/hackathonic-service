const epilogue = require('epilogue');
const { handleResourceAccess } = require('../lib/authentication');
const models = require('../models');
const BadRequestError = epilogue.Errors.BadRequestError;

const voteResource = epilogue.resource({
  model: models.Vote,
  endpoints: ['/vote', '/vote/:id']
});

voteResource.create.auth(handleResourceAccess);
voteResource.list.auth(handleResourceAccess);
voteResource.read.auth(handleResourceAccess);
voteResource.update.auth(handleResourceAccess);
voteResource.delete.auth(handleResourceAccess);

voteResource.create.start((req, res, context) => {
  const { projectId, personId } = req.body;
  if (!projectId || !personId) {
    throw new BadRequestError('Missing projectId or personId');
  }
  return models.Project
    .findById(projectId)
    .then(project => {
      if (!project) {
        return context.error(400, 'Project with given id does not exist.');
      }
      return models.Team
        .findById(project.get('teamId'), {
          include: [{
            model: models.Person,
            where: {
              id: personId
            }
          }]
        })
        .then(team => {
          if (!team) {
            return context.error(400, 'Given person is not a member of the team that owns the project.');
          }
          return models.Vote.findAll({
            where: { personId, projectId }
          }).then(vote => {
            if (vote.length) {
              return context.error(400, 'Vote with given personId and projectId already exists.');
            }
            return context.continue();
          });
        });
    });
});

module.exports = voteResource;
