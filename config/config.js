var path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'chat-api',
    },
    port: process.env.PORT || 3000,
    db: {
      database: process.env.DB_NAME || 'chat-api-develop',
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '00000000',
      options: {
        host: process.env.DB_HOSTNAME || 'localhost',
        dialect: 'mysql',

        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        operatorsAliases: false,
      },
    },
  },
  production: {
    root: rootPath,
    app: {
      name: 'chat-api',
    },
    port: process.env.PORT || 3000,
    db: {
      database: process.env.DB_NAME || 'chat-api-develop',
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '00000000',
      options: {
        host: process.env.DB_HOSTNAME || 'localhost',
        dialect: 'mysql',

        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        operatorsAliases: false,
      },
    },
  },

  // test: {
  //   root: rootPath,
  //   app: {
  //     name: "chat-api"
  //   },
  //   port: process.env.PORT || 3000,
  //   db: "mysql://localhost/chat-api-test"
  // },

  // production: {
  //   root: rootPath,
  //   app: {
  //     name: "chat-api"
  //   },
  //   port: process.env.PORT || 3000,
  //   db: "mysql://localhost/chat-api-production"
  // }
};

module.exports = config[env];
