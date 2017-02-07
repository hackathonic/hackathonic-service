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
  const {hackathonId, projectId, personId} = req.body;
  if (!hackathonId || !projectId || !personId) {
    throw new BadRequestError('Missing hackathonId, projectId or personId');
  }
  return models.Hackathon
    .findById(hackathonId, {
      include: [{
        model: models.Project,
        where: {
          id: projectId
        }
      }]
    })
    .then(hackathon => {
      if (!hackathon || !hackathon.get('projects') || !hackathon.get('projects').length) {
        return context.error(400, 'Hackathon or Project with given id does not exist.');
      }
      const project = hackathon.get('projects')[0];
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
            where: { hackathonId, personId, projectId }
          }).then(vote => {
            if (vote.length) {
              return context.error(400, 'Vote with given personId, hackathonId and projectId already exists.');
            }
            return context.continue();
          });
        });
    });
});

module.exports = voteResource;
