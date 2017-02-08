require('dotenv').config({
  path: `${__dirname}/../.env`
});

const {
  HOST,
  PORT,
  TEST_OAUTH_TOKEN,
  TEST_PERSON_GITHUB_ID,
  TEST_PERSON_EMAIL
} = process.env;

const baseUrl = `http://${HOST}:${PORT}/api/v1`;
const chakram = require('chakram');
const expect = chakram.expect;

chakram.setRequestDefaults({ baseUrl, qs: { access_token: TEST_OAUTH_TOKEN } });

describe('Voting', () => {
  let hackathonId;
  let ourProjectId;
  let theirProjectId;
  let personId;
  let teamId;

  before(() => {
    return chakram.post('/hackathon', {
      'name': 'Hackathon',
      'startDate': 1484678880990,
      'endDate': 1484678880991
    })
    .then(response => {
      hackathonId = response.body.id;
    })
    .then(() => {
      return chakram.post('/team', { name: 'A-Team' });
    })
    .then(response => {
      teamId = response.body.id;
    })
    .then(() => {
      return chakram.post('/project', {
        name: 'Their project',
        description: 'Their project description',
        hackathonId
      });
    })
    .then(response => {
      theirProjectId = response.body.id;
    })
    .then(() => {
      return chakram.post('/project', {
        name: 'Our project',
        description: 'Our project description',
        teamId,
        hackathonId
      });
    })
    .then(response => {
      ourProjectId = response.body.id;
    })
    .then(() => {
      return chakram.post('/person', {
        name: 'John Doe',
        githubId: TEST_PERSON_GITHUB_ID,
        email: TEST_PERSON_EMAIL,
        teamId
      });
    })
    .then(response => {
      personId = response.body.id;
    });
  });

  after(() => chakram.waitFor([
    chakram.delete(`/project/${ourProjectId}`),
    chakram.delete(`/project/${theirProjectId}`),
    chakram.delete(`/person/${personId}`),
    chakram.delete(`/team/${teamId}`)
  ]));

  it('should be possible only if the person takes participate in hackathon which given project is part.', () => {
    return chakram.post('/vote', {
      points: 5,
      projectId: theirProjectId
    }).then(response => {
      expect(response).to.have.status(201);
      expect(response).to.contain.json({
        points: 5,
        projectId: theirProjectId
      });
    });
  });

  it('should be impossible to vote on own project.', () => {
    return chakram.post('/vote', {
      points: 5,
      projectId: ourProjectId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/own project/);
    });
  });
});
