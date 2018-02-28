const sendMessageToUser = async (idno, msg, fromUserId, db, socket) => {
  let chatGroup = await db.ChatGroup.find({
    where: {
      idno: idno,
      isActive: 1
    }
  });
  if (!chatGroup) return; //找不到此群組

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
    recipientId: null,
    senderId: fromUserId,
    groupId: idno,
    messageId: savedMessage.idno,
    isRead: 0
  }).save();
  savedchatMessageRecipient = savedchatMessageRecipient.get({
    plain: true
  });
  savedchatMessageRecipient.ChatMessage = savedMessage;
  socket.broadcast
    .to(`group-${idno}`)
    .emit("my message", savedchatMessageRecipient);
};

export default sendMessageToUser;
