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
      // socket.on("message", ({type,idno,msg}) => {
      //   io.emit("message", {
      //     data,
      //     from: socket.request.session.user.username
      //   });
      // });

      socket.on("message", async function({ type, idno, msg }) {
        const fromUserId = socket.request.session.user.idno;
        if (!idno) {
          return;
        }
        let chatUser = await db.ChatUser.find({
          where: {
            idno: idno
          }
        });
        if (!chatUser) return; //找不到使用者

        let savedMessage = await db.ChatMessage.build({
          subject: null,
          messageBody: msg,
          creatorId: fromUserId,
          parentMessageId: null,
          expiryDate: null,
          isActive: 1
        }).save();
        savedMessage = savedMessage.get({
          plain: true
        });
        let savedchatMessageRecipient = await db.ChatMessageRecipient.build({
          recipientId: idno,
          senderId: fromUserId,
          groupId: null,
          messageId: savedMessage.idno,
          isRead: 0
        }).save();
        savedchatMessageRecipient = savedchatMessageRecipient.get({
          plain: true
        });
        savedchatMessageRecipient.ChatMessage = savedMessage;
        socket.broadcast
          .to(`user-${idno}`)
          .emit("my message", savedchatMessageRecipient);
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
