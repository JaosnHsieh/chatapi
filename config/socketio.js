import sendMessageToUser from "../libs/sendMessageToUser";
import sendMessageToGroup from "../libs/sendMessageToGroup";
var onlineUsers = {};
// setInterval(function() {
// //   console.log("onlineUsers", onlineUsers);
// }, 5000);
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
module.exports = async (io, db) => {
  try {
    io.on("connection", async socket => {
      console.log("a user connected");
      if (socket.request.session && socket.request.session.user) {
        var user = socket.request.session.user;
        getOnline(user.idno, socket.id);

        //join user's own chanel
        socket.join(`user-${user.idno}`);

        //join channel
        socket.on(`join-channels`, groupIds => {
          if (groupIds && Array.isArray(groupIds)) {
            groupIds.forEach(groupId => {
              socket.join(`group-${groupId}`);
            });
          }
        });

        //
        socket.on("message", async ({ chatType, idno, msg }) => {
          if (!idno || !msg) {
            return;
          }
          idno = idno = parseInt(idno, 10);
          const fromUserId = socket.request.session.user.idno;
          if (chatType === "user") {
            sendMessageToUser(idno, msg, fromUserId, db, socket);
          } else if ((chatType = "group")) {
            sendMessageToGroup(idno, msg, fromUserId, db, socket);
          }
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
  } catch (err) {
    return console.log("socketio error", error);
  }
};
