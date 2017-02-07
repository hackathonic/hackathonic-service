const database = require('./lib/database');
const app = require('./lib/app');

module.exports = {
  start: () => database.sync().then(() => app)
};
