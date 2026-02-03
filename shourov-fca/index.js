const ShourovAPI = require('./src/api/api');
const { DEFAULT_OPTIONS } = require('./src/utils/constants');

function login(credentials, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (!credentials || (!credentials.appState && !credentials.email)) {
    return callback(new Error('Invalid credentials. Please provide appState or email/password'));
  }

  const appState = credentials.appState;
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const api = new ShourovAPI(appState, mergedOptions);

  api.initialize()
    .then(() => {
      callback(null, api);
    })
    .catch((error) => {
      callback(error, null);
    });
}

login.promises = function(credentials, options = {}) {
  return new Promise((resolve, reject) => {
    login(credentials, options, (err, api) => {
      if (err) return reject(err);
      resolve(api);
    });
  });
};

module.exports = {
  login,
  ShourovAPI
};
