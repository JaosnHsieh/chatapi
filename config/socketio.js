var onlineUsers = {};
setInterval(function() {
  console.log("onlineUsers", onlineUsers);
}, 5000);
var getOnline = function(userIdno, socketId) {
  onlineUsers[userIdno] = onlineUsers[userIdno] || [];
  onlineUsers[userIdno] = [...onlineUsers[userIdno], socketId];
};
var getOffline = function(userIdno, socketId) {
  onlineUsers[userIdno] = onlineUsers[userIdno].filter(ele => ele !== socketId);
  if (onlineUsers[userIdno].length === 0) {
    delete onlineUsers[userIdno];
  }
};
module.exports = function(io) {
  io.on("connection", function(socket) {
    console.log("a user connected");
    if (socket.request.session && socket.request.session.user) {
      var user = socket.request.session.user;
      console.log("user", user);
      getOnline(user.idno, socket.id);
      //   console.log("onlineUsers", onlineUsers);
      socket.join(`user-${user.idno}`);
      socket.on("message", data => {
        console.log("on message data = ", data);
        io.emit("message", {
          data,
          from: socket.request.session.user.username
        });
      });

      socket.on("say to someone", function(idno, msg) {
        socket.broadcast.to(`user-${idno}`).emit("my message", msg);
      });

      socket.on("disconnect", function() {
        console.log("user disconnected");
        getOffline(user.idno, socket.id);
      });
    } else {
      socket.disconnect(true);
    }
    // socket.on("test", msg => {
    //   console.log("msg", msg);
    //   console.log("socket.request.session", socket.request.session);
    // });
  });
};
