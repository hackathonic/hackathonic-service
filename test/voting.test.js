require('dotenv').config({
  path: `${__dirname}/../.env`
});

const {
  HOST,
  PORT,
  TEST_OAUTH_TOKEN
} = process.env;

const baseUrl = `http://${HOST}:${PORT}/api/v1`;
const chakram = require('chakram');
const uuidV4 = require('uuid/v4');
const expect = chakram.expect;

chakram.setRequestDefaults({ baseUrl, qs: { access_token: TEST_OAUTH_TOKEN } });

describe('Voting', () => {
  let projectId;
  let personId;
  let teamId;

  before(() => {
    return chakram.post('/team', { name: 'A-Team' })
    .then(response => {
      teamId = response.body.id;
    })
    .then(() => {
      return chakram.post('/project', {
        name: 'Awesomium',
        description: 'An epic project',
        teamId
      });
    })
    .then(response => {
      projectId = response.body.id;
    })
    .then(() => {
      return chakram.post('/person', {
        name: 'John Doe',
        email: 'john.doe@example.com',
        teamId
      });
    })
    .then(response => {
      personId = response.body.id;
    });
  });

  after(() => chakram.waitFor([
    chakram.delete(`/project/${projectId}`),
    chakram.delete(`/person/${personId}`),
    chakram.delete(`/team/${teamId}`)
  ]));

  it('should be possible only with valid personId and projectId', () => {
    return chakram.post('/vote', {
      points: 5,
      projectId,
      personId
    }).then(response => {
      expect(response).to.have.status(201);
      expect(response).to.contain.json({
        points: 5,
        projectId,
        personId
      });
    });
  });

  it('should be impossible if given project does not have a proper relation with other entities', () => {
    return chakram.post('/vote', {
      points: 5,
      projectId: uuidV4(),
      personId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/Project .* does not exist/);
    });
  });

  it('should be impossible if given person does not have a proper relation with other entities', () => {
    return chakram.post('/vote', {
      points: 5,
      projectId,
      personId: uuidV4()
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/Given person is not a member/);
    });
  });

  it('should be impossible if any of required relations is missing', () => {
    return chakram.post('/vote', {
      points: 5,
      personId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/Missing/);
    });
  });

  it('should be impossible for the same personId and projectId', () => {
    return chakram.post('/vote', {
      points: 5,
      projectId,
      personId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/Vote .* already exists/);
    });
  });
});
