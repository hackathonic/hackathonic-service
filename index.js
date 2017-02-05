require('dotenv').config({
  path: `${__dirname}/.env`
});
require('./server').start().then(app => {
  const host = process.env.APP_HOST;
  const port = process.env.APP_PORT;
  app.listen(port, host, () => {
    console.info(`Service is running on http://${host}:${port}`);
  });
});
