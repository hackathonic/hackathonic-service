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
  const UNIQUE_EMAIL = 'john.doe@example.com';
  const UNIQUE_TEAM_NAME = 'A-Team';

  let hackathonId;
  let projectId;
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
      return chakram.post('/team', { name: UNIQUE_TEAM_NAME });
    })
    .then(response => {
      teamId = response.body.id;
    })
    .then(() => {
      return chakram.post('/project', {
        name: 'Awesomium',
        description: 'An epic project',
        hackathonId,
        teamId
      });
    })
    .then(response => {
      projectId = response.body.id;
    })
    .then(() => {
      return chakram.post('/person', {
        name: 'John Doe',
        email: UNIQUE_EMAIL,
        teamId
      });
    })
    .then(response => {
      personId = response.body.id;
    });
  });

  after(() => chakram.waitFor([
    chakram.delete(`/hackathon/${hackathonId}`),
    chakram.delete(`/project/${projectId}`),
    chakram.delete(`/person/${personId}`),
    chakram.delete(`/team/${teamId}`)
  ]));

  it('should be possible only with valid personId, hackathonId and projectId', () => {
    return chakram.post('/vote', {
      points: 5,
      hackathonId,
      projectId,
      personId
    }).then(response => {
      expect(response).to.have.status(201);
      expect(response).to.contain.json({
        points: 5,
        hackathonId,
        projectId,
        personId
      });
    });
  });

  it('should be impossible if given hackathon does not have a proper relation with other entities', () => {
    return chakram.post('/vote', {
      points: 5,
      hackathonId: uuidV4(),
      projectId,
      personId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/Hackathon or Project .* does not exist/);
    });
  });

  it('should be impossible if given project does not have a proper relation with other entities', () => {
    return chakram.post('/vote', {
      points: 5,
      hackathonId,
      projectId: uuidV4(),
      personId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/Hackathon or Project .* does not exist/);
    });
  });

  it('should be impossible if given person does not have a proper relation with other entities', () => {
    return chakram.post('/vote', {
      points: 5,
      hackathonId,
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

  it('should be impossible for the same personId, hackathonId and projectId', () => {
    return chakram.post('/vote', {
      points: 5,
      hackathonId,
      projectId,
      personId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/Vote .* already exists/);
    });
  });
});
