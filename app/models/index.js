var fs = require("fs"),
  path = require("path"),
  Sequelize = require("sequelize"),
  dbConfig = require("../../config/config").db,
  moment = require("moment");
db = {};
let { database, username, password, options } = dbConfig;
var sequelize = new Sequelize(database, username, password, options);

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return file.indexOf(".") !== 0 && file !== "index.js";
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
