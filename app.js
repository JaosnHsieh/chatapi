var path = require("path");
global.appRoot = path.resolve(__dirname);

var express = require("express"),
  config = require("./config/config"),
  db = require("./app/models");

require("babel-register");
require("babel-polyfill");

var app = express();

var http = require("http").Server(app);
var io = require("socket.io")(http);
var configSocketIo = require("./config/socketio.js");
configSocketIo(io, db);

module.exports = require("./config/express")(app, config, io);

db.sequelize
  .sync()
  .then(function() {
    if (!module.parent) {
      http.listen(config.port, function() {
        console.log("Express server listening on port " + config.port);
      });
    }
  })
  .catch(function(e) {
    throw new Error(e);
  });
