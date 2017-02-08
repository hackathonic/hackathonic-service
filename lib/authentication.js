const request = require('request');

const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET
} = process.env;

exports.getUserInfoFromToken = (token) => {
  const url = `https://api.github.com/applications/${GITHUB_CLIENT_ID}/tokens/${token}`;
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'hackathonic-service'
      },
      auth: {
        user: GITHUB_CLIENT_ID,
        pass: GITHUB_CLIENT_SECRET
      },
      json: true,
      url
    };
    request.get(options, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      if (response.statusCode === 404) {
        resolve(false);
        return;
      }
      resolve(response.body);
    });
  });
};

exports.checkTokenValidity = (token) => {
  return exports.getUserInfoFromToken(token)
    .then(userInfo => {
      if (!userInfo) {
        return false;
      }
      return true;
    });
};

exports.handleResourceAccess = (req, res, context) => {
  const accessToken = req.query.access_token;

  if (!accessToken) {
    return context.error(401, 'Unauthorized');
  }

  return exports.checkTokenValidity(accessToken).then(isValid => {
    if (!isValid) {
      return context.error(401, 'Unauthorized');
    }
    return context.continue;
  });
};
