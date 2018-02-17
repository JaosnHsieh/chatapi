var fs = require("fs"),
  path = require("path"),
  Sequelize = require("sequelize"),
  config = require("../../config/config"),
  moment = require("moment");
db = {};

// var sequelize = new Sequelize(config.db);

var sequelize = new Sequelize("ChatAPI", "sa", "`1qa~!QA", {
  host: "192.168.11.24",
  //// sequelize 的 log 選項 ， 目前是 print console和寫入 根目錄/log/db-query.log 檔案
  logging: function(msg) {
    console.log(msg);
    fs.appendFile(
      path.join(global.appRoot, "log", "db-query.log"),
      moment().toString() + " : " + msg + "\n",
      function(err) {
        if (err) throw err;
      }
    );
  },

  dialectOptions: {
    instanceName: "MSSQLSERVER"
  },
  dialect: "mssql",
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

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
