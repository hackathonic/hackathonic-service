const epilogue = require('epilogue');
const { handleResourceAccess, getUserInfoFromToken } = require('../lib/authentication');
const models = require('../models');
const BadRequestError = epilogue.Errors.BadRequestError;
const CONSTS = require('../consts');

const voteResource = epilogue.resource({
  model: models.Vote,
  endpoints: ['/vote', '/vote/:id']
});

voteResource.list.auth(handleResourceAccess);
voteResource.read.auth(handleResourceAccess);
voteResource.update.auth(handleResourceAccess);
voteResource.delete.auth(handleResourceAccess);

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

const projectOutsideHackathonCheck = (personId, projectId) => {
  const findOurHackathons = models.Hackathon.findAll({
    attributes: ['id'],
    include: [{
      model: models.Project,
      attributes: [],
      include: [{
        model: models.Team,
        attributes: [],
        include: [{
          model: models.Person,
          attributes: [],
          where: { id: personId }
        }]
      }]
    }]
  });

  const findTheirHackathons = models.Hackathon.findAll({
    attributes: ['id'],
    where: {
      stage: CONSTS.STAGE_VOTING
    },
    include: [{
      model: models.Project,
      attributes: [],
      where: { id: projectId }
    }]
  });

  return Promise.all([
    findOurHackathons,
    findTheirHackathons
  ])
  .then(([ourHackathons, theirHackathons]) => {
    const ourIds = ourHackathons.map(getHackatonIds);
    const theirIds = theirHackathons.map(getHackatonIds);
    // if no common hackathons are found, then it means
    // that projectId reffers to a project in a hackathon
    // that the person is not part of.
    return !hasCommonIds(ourIds, theirIds);
  });
};

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
      return models.Person.findByGithubId(githubId)
        .then(person => {
          if (!person) {
            return context.error(401, 'Unauthorized');
          }
          const personId = person.get('id');
          return voteForOwnTeamCheck(personId, projectId)
            .then(isVotingForOwnTeam => {
              if (isVotingForOwnTeam) {
                return context.error(400, 'It\'s not nice to vote for own project.');
              }
              req.body.personId = personId;

              return projectOutsideHackathonCheck(personId, projectId)
                .then(isOutsidehackathon => {
                  if (isOutsidehackathon) {
                    return context.error(400, 'Project is in hackathon that is in a non-voting stage or you are not participating in that hackathon');
                  }
                  return context.continue;
                });
            });
        });
    });
});

const getHackatonIds = instance => instance.get('id');

const findCommonIds = (ourIds, theirIds) => theirIds.filter(theirId => ourIds.find(ourId => theirId === ourId));

const hasCommonIds = (ourIds, theirIds) => findCommonIds(ourIds, theirIds).length > 0;

module.exports = voteResource;
