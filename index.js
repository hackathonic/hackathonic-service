require('dotenv').config({
  path: `${__dirname}/.env`
});
require('./server').start().then(app => {
  const host = process.env.HOST;
  const port = process.env.PORT;
  app.listen(port, host, () => {
    console.info(`Service is running on http://${host}:${port}`);
  });
});
