require('dotenv').config({
  path: `${__dirname}/.env`
});

const database = require('./lib/database');
const app = require('./lib/app');

// Create database and listen
database
  .sync({
    force: true
  })
  .then(() => {
    const host = app.get('host');
    const port = app.get('port');
    app.listen(port, host, () => {
      console.info(`Server listening on http://${host}:${port}`);
    });
  });
