require('dotenv').config({
  path: `${__dirname}/../.env`
});

const {
  HOST,
  PORT,
  TEST_OAUTH_TOKEN,
  TEST_PERSON_GITHUB_ID
} = process.env;

const baseUrl = `http://${HOST}:${PORT}/api/v1`;
const chakram = require('chakram');
const expect = chakram.expect;

chakram.setRequestDefaults({ baseUrl, qs: { access_token: TEST_OAUTH_TOKEN } });

describe('Hackathon', () => {
  let personId;
  let hackathonId;

  after(() => chakram.waitFor([
    chakram.delete(`/hackathon/${hackathonId}`),
    chakram.delete(`/person/${personId}`)
  ]));

  it('cannot be created witout creating an account first', () => {
    return chakram.post(`/hackathon`, {
      name: 'Hackathon',
      startDate: 1484678880990,
      endDate: 1484678880991
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.match(/only by registered person/i);
    });
  });

  it('can be created, when an accout is created first', () => {
    return chakram.post(`/person`, {
      name: 'John Doe',
      email: 'john.doe@exampleemail.com',
      githubId: TEST_PERSON_GITHUB_ID
    }).then((response) => {
      personId = response.body.id;
    }).then(() => {
      return chakram.post(`/hackathon`, {
        name: 'Hackathon',
        startDate: 1484678880990,
        endDate: 1484678880991
      }).then(response => {
        hackathonId = response.body.id;
        expect(response).to.have.status(201);
      });
    });
  });
});

describe('Hackathon stage', () => {
  let hackathonId;
  let personId;

  before(() => {
    return chakram.post(`/person`, {
      name: 'John Doe',
      email: 'john.doe@exampleemail.com',
      githubId: TEST_PERSON_GITHUB_ID
    }).then(response => {
      personId = response.body.id;
    }).then(() => {
      return chakram.post(`/hackathon`, {
        name: 'Hackathon',
        startDate: 1484678880990,
        endDate: 1484678880991
      });
    }).then((response) => {
      hackathonId = response.body.id;
    });
  });

  after(() => chakram.waitFor([
    chakram.delete(`/hackathon/${hackathonId}`),
    chakram.delete(`/person/${personId}`)
  ]));

  it('should have value unlisted by default', () =>
    chakram.get(`/hackathon/${hackathonId}`).then(response => {
      expect(response).to.contain.json({
        stage: 'unlisted'
      });
    }));

  it('should be changed only to other valid value', () =>
    chakram.put(`/hackathon/${hackathonId}`, {
      stage: 'running'
    }).then(response => expect(response).to.contain.json({
      stage: 'running'
    })));

  it('should be not changed to an invalid value', () =>
    chakram.put(`/hackathon/${hackathonId}`, {
      stage: 'fakestage'
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.contain('Invalid stage value');
    })
  );
});
