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
const expect = chakram.expect;

chakram.setRequestDefaults({ baseUrl, qs: { access_token: TEST_OAUTH_TOKEN } });

describe('Hackathon stage', () => {
  let hackathonId;

  before(() => chakram.post(`/hackathon`, {
    name: 'Hackathon',
    startDate: 1484678880990,
    endDate: 1484678880991
  }).then(response => {
    hackathonId = response.body.id;
  }));

  after(() => chakram.delete(`/hackathon/${hackathonId}`));

  it('should have value unlisted by default', () =>
    chakram.get(`/hackathon/${hackathonId}`).then(response => {
      expect(response).to.contain.json({
        stage: 'unlisted'
      });
    }));

  it('should be changed to other valid stage', () =>
    chakram.put(`/hackathon/${hackathonId}`, {
      stage: 'running'
    }).then(response => expect(response).to.contain.json({
      stage: 'running'
    })));

  it('should be not changed to an invalid stage', () =>
    chakram.put(`/hackathon/${hackathonId}`, {
      stage: 'fakestage'
    }).then(response => {
      expect(response).to.have.status(400);
      expect(response.body.message).to.contain('Invalid stage value');
    }));
});
