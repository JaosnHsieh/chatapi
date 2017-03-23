var fs = require('fs'),
  path = require('path'),
  Sequelize = require('sequelize'),
  config = require('../../config/config'),
  db = {};

// var sequelize = new Sequelize(config.db);

var sequelize = new Sequelize('ChatAPI', 'sa', '`1qa~!QA', {
  host: '192.168.11.24',
  dialectOptions: {
  instanceName: 'MSSQLSERVER'
  },
  dialect: 'mssql',
  pool: {
  max: 5,
  min: 0,
  idle: 10000
  }
  });

fs.readdirSync(__dirname).filter(function (file) {
  return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function (file) {
  var model = sequelize['import'](path.join(__dirname, file));
  db[model.name] = model;
});

Object.keys(db).forEach(function (modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
