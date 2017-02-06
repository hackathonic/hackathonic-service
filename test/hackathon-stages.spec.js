require('dotenv').config({
  path: `${__dirname}/../.env`
});

const {
  HOST,
  PORT,
  TEST_OAUTH_TOKEN
} = process.env;

const frisby = require('frisby');
const baseUrl = `http://${HOST}:${PORT}/api/v1`;
const token = TEST_OAUTH_TOKEN;

frisby.create('Creates a hackathon')
  .post(`${baseUrl}/hackathon?access_token=${token}`, {
    'name': 'Hackathon',
    'startDate': 1484678880990,
    'endDate': 1484678880991
  }, {
    json: true
  })
  .expectStatus(201)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    stage: 'unlisted',
    name: 'Hackathon',
    startDate: '2017-01-17T18:48:00.990Z',
    endDate: '2017-01-17T18:48:00.991Z'
  })
  .after((err, res, body) => {
    if (err) throw err;
    frisby.create('Change stage of a hackathon')
      .put(`${baseUrl}/hackathon/${body.id}?access_token=${token}`, {
        stage: 'running'
      }, {
        json: true
      })
      .expectStatus(200)
      .expectJSON({
        stage: 'running'
      })
      .expectHeaderContains('content-type', 'application/json')
    .toss();
  })
  .after((err, res, body) => {
    if (err) throw err;
    frisby.create('Change stage of a hackathon to a invalid value')
      .put(`${baseUrl}/hackathon/${body.id}?access_token=${token}`, {
        stage: 'fakestage'
      }, {
        json: true
      })
      .expectStatus(400)
      .expectJSONTypes('message', (message) => /Invalid stage value/.test(message))
      .expectHeaderContains('content-type', 'application/json')
    .toss();
  })
.toss();
