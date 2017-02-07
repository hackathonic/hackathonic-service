const database = require('./lib/database');
const app = require('./lib/app');

module.exports = {
  start: () => database.sync({ force: true }).then(() => app)
};
