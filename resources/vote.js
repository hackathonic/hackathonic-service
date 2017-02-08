const epilogue = require('epilogue');
const { handleResourceAccess, getUserInfoFromToken } = require('../lib/authentication');
const models = require('../models');
const BadRequestError = epilogue.Errors.BadRequestError;

const voteResource = epilogue.resource({
  model: models.Vote,
  endpoints: ['/vote', '/vote/:id']
});

voteResource.list.auth(handleResourceAccess);
voteResource.read.auth(handleResourceAccess);
voteResource.update.auth(handleResourceAccess);
voteResource.delete.auth(handleResourceAccess);

const getPersonByGithubId = (githubId) => models.Person.findAll({
  where: { githubId },
  limit: 1
}).then(persons => persons[0]);

const voteForOwnTeamCheck = (personId, projectId) => models.Team.findAll({
  include: [{
    model: models.Person,
    where: {
      id: personId
    }
  }, {
    model: models.Project,
    where: {
      id: projectId
    }
  }]
}).then(teams => teams.length > 0);

// @TODO: Check if given project is in the same hackathon as voting person
// @TODO: Check if given project is in a hackathon with stage==='voting'
voteResource.create.start((req, res, context) => {
  const accessToken = req.query.access_token;
  const { projectId } = req.body;
  if (!projectId) {
    throw new BadRequestError('Missing projectId');
  }

  return getUserInfoFromToken(accessToken)
    .then(userInfo => {
      if (!userInfo) {
        return context.error(401, 'Unauthorized');
      }
      const githubId = userInfo.user.id;
      return getPersonByGithubId(githubId)
        .then(person => {
          if (!person) {
            return context.error(401, 'Unauthorized');
          }
          return voteForOwnTeamCheck(person.get('id'), projectId)
            .then(isVotingForOwnTeam => {
              if (isVotingForOwnTeam) {
                return context.error(400, 'It\'s not nice to vote for own project.');
              }
              return context.continue;
            });
        });
    });
});

module.exports = voteResource;
