const sendMessageToUser = async (idno, msg, fromUserId, db, socket) => {
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
};

export default sendMessageToUser;
