var path = require("path");
global.appRoot = path.resolve(__dirname);

var express = require("express"),
  config = require("./config/config"),
  db = require("./app/models");

var app = express();

var http = require("http").Server(app);
var io = require("socket.io")(http);

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

io.on("connection", function(socket) {
  console.log("a user connected");
  socket.on("test", msg => {
    console.log("msg", msg);
    console.log("socket.request.session", socket.request.session);
  });
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
});
