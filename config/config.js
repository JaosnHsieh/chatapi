var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'chat-api'
    },
    port: process.env.PORT || 3000,
    db: 'mysql://localhost/chat-api-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'chat-api'
    },
    port: process.env.PORT || 3000,
    db: 'mysql://localhost/chat-api-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'chat-api'
    },
    port: process.env.PORT || 3000,
    db: 'mysql://localhost/chat-api-production'
  }
};

module.exports = config[env];
