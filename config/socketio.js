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
module.exports = function(io, db) {
  io.on("connection", function(socket) {
    console.log("a user connected");
    if (socket.request.session && socket.request.session.user) {
      var user = socket.request.session.user;
      getOnline(user.idno, socket.id);
      //   console.log("onlineUsers", onlineUsers);
      socket.join(`user-${user.idno}`);
      socket.on("message", data => {
        io.emit("message", {
          data,
          from: socket.request.session.user.username
        });
      });

      socket.on("toSomeone", function(idno, msg) {
        const fromUserId = socket.request.session.user.idno;
        if (!idno) {
          return;
        }

        db.ChatUser.find({
          where: {
            idno: idno
          }
        })
          .then(chatUser => {
            //找不到使用者
            if (chatUser == null) {
              return;
            }
            return db.ChatMessage.build({
              subject: null,
              messageBody: msg,
              creatorId: fromUserId,
              parentMessageId: null,
              expiryDate: null,
              isActive: 1
            }).save();
          })
          .then(msg => {
            return Promise.all([
              db.ChatMessageRecipient.build({
                recipientId: idno,
                senderId: fromUserId,
                recipientGroupId: null,
                messageId: msg.idno,
                isRead: 0
              }).save(),
              msg
            ]);
          })
          .then(data => {
            let ChatMessageRecipient = data[0].get({
              plain: true
            });
            let ChatMessage = data[1].get({
              plain: true
            });
            ChatMessageRecipient.ChatMessage = ChatMessage;

            socket.broadcast
              .to(`user-${idno}`)
              .emit("my message", ChatMessageRecipient);
          })
          .error(error => {
            console.error(error);
          });
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
