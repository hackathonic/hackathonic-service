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

const CONSTS = require('../consts');

const baseUrl = `http://${HOST}:${PORT}/api/v1`;
const chakram = require('chakram');
const expect = chakram.expect;

chakram.setRequestDefaults({ baseUrl, qs: { access_token: TEST_OAUTH_TOKEN } });
describe('Voting', () => {
  let hackathonId;
  let unlistedHackathonId;
  let alienHackathonId;
  let ourProjectId;
  let ourUnlistedProjectId;
  let theirProjectId;
  let alienProjectId;
  let unlistedProjectId;
  let personId;
  let teamId;
  let voteId;

  before(() => {
    return chakram.post('/person', {
      name: 'John Doe',
      githubId: TEST_PERSON_GITHUB_ID,
      email: TEST_PERSON_EMAIL
    })
    .then(response => {
      personId = response.body.id;
    })
    .then(() => {
      return chakram.post('/hackathon', {
        'name': 'Hackathon',
        'startDate': 1484678880990,
        'endDate': 1484678880991,
        'stage': CONSTS.STAGE_VOTING
      });
    })
    .then(response => {
      hackathonId = response.body.id;
    })
    .then(() => {
      return chakram.post('/hackathon', {
        'name': 'Alien hackathon',
        'startDate': 1484678880990,
        'endDate': 1484678880991,
        'stage': CONSTS.STAGE_VOTING
      });
    })
    .then(response => {
      alienHackathonId = response.body.id;
    })
    .then(() => {
      return chakram.post('/hackathon', {
        'name': 'Alien hackathon',
        'startDate': 1484678880990,
        'endDate': 1484678880991,
        'stage': CONSTS.STAGE_UNLISTED
      });
    })
    .then(response => {
      unlistedHackathonId = response.body.id;
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
      return chakram.post('/project', {
        name: 'Our unlisted project',
        description: 'Our unlisted project description',
        teamId,
        hackathonId: unlistedHackathonId
      });
    })
    .then(response => {
      ourUnlistedProjectId = response.body.id;
    })
    .then(() => {
      return chakram.post('/project', {
        name: 'Alien project',
        description: 'Project in different hackathon',
        hackathonId: alienHackathonId
      });
    })
    .then(response => {
      alienProjectId = response.body.id;
    })
    .then(() => {
      return chakram.post('/project', {
        name: 'Unlisted project',
        description: 'Project in unlisted hackathon',
        hackathonId: unlistedHackathonId
      });
    })
    .then(response => {
      unlistedProjectId = response.body.id;
    })
    .then(() => {
      return chakram.put(`/person/${personId}`, { teamId });
    });
  });

  after(() => chakram.waitFor([
    chakram.delete(`/hackathon/${hackathonId}`),
    chakram.delete(`/hackathon/${alienHackathonId}`),
    chakram.delete(`/hackathon/${unlistedHackathonId}`),
    chakram.delete(`/project/${ourProjectId}`),
    chakram.delete(`/project/${theirProjectId}`),
    chakram.delete(`/project/${alienProjectId}`),
    chakram.delete(`/project/${unlistedProjectId}`),
    chakram.delete(`/project/${ourUnlistedProjectId}`),
    chakram.delete(`/person/${personId}`),
    chakram.delete(`/team/${teamId}`)
  ]));

  it('should be impossible when points are negative', () => {
    return chakram.post('/vote', {
      points: -1,
      projectId: theirProjectId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/validation error/i);
    });
  });

  it('should be impossible when points are out of range', () => {
    return chakram.post('/vote', {
      points: 11,
      projectId: theirProjectId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/validation error/i);
    });
  });

  it('should be impossible when points are not a number', () => {
    return chakram.post('/vote', {
      points: 'eleven',
      projectId: theirProjectId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/validation error/i);
    });
  });

  it('should be possible for projects that are not your own', () => {
    return chakram.post('/vote', {
      points: 5,
      projectId: theirProjectId
    }).then(response => {
      voteId = response.body.id;
      expect(response).to.have.status(201);
      expect(response).to.contain.json({
        points: 5,
        projectId: theirProjectId
      });
    });
  });

  it('should be impossible for projects that are not in hackathon at voting stage', () => {
    return chakram.post('/vote', {
      points: 5,
      projectId: unlistedProjectId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/non-voting stage/i);
    });
  });

  it('should be impossible twice for the same project', () => {
    return chakram.post('/vote', {
      points: 5,
      projectId: theirProjectId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/already voted/i);
    });
  });

  it('should be possible by editing an existing vote', () => {
    return chakram.put(`/vote/${voteId}`, {
      points: 6,
      projectId: theirProjectId
    }).then(response => {
      expect(response).to.have.status(200);
      expect(response).to.contain.json({
        points: 6,
        projectId: theirProjectId
      });
    });
  });

  it('should be impossible on your own projects.', () => {
    return chakram.post('/vote', {
      points: 5,
      projectId: ourProjectId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/own project/);
    });
  });

  it('should be impossible for projects outside current hackathon', () => {
    return chakram.post('/vote', {
      points: 5,
      projectId: alienProjectId
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/you are not participating in that hackathon/);
    });
  });
});
