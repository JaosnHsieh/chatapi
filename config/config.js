var path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'development',
  isUseSqlite = process.env.IS_USE_SQLITE === 'true';

const sqlLiteDbConfig = {
  database: '',
  username: '',
  password: '',
  options: {
    dialect: 'sqlite',
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
    storage: path.join(__dirname, '..', 'chatapi.sqlite'),
  },
};

const mysqlDbConfig = {
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
};

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'chat-api',
    },
    port: process.env.PORT || 3000,
    db: {
      ...(isUseSqlite ? sqlLiteDbConfig : mysqlDbConfig),
    },
  },
  production: {
    root: rootPath,
    app: {
      name: 'chat-api',
    },
    port: process.env.PORT || 3000,
    db: {
      ...(isUseSqlite ? sqlLiteDbConfig : mysqlDbConfig),
    },
  },
};

module.exports = config[env];
