const sendMessageToGroup = async (idno, msg, fromUserId, db, socket) => {
  //找出群組內的USERS
  let chatUserXgroups = await db.ChatUserXgroup.findAll({
    where: {
      groupId: idno,
      isActive: 1
    }
  });
  if (!chatUserXgroups.length > 0) return; //群組沒使用者

  //建立訊息
  let newMsg = await db.ChatMessage.build({
    subject: null,
    messageBody: msg,
    creatorId: fromUserId,
    parentMessageId: null,
    expiryDate: null,
    isActive: 1
  }).save();

  //建立群組每個人的訊息紀錄
  let msgRecipients = chatUserXgroups.map(chatUserXgroup => {
    return {
      recipientId: chatUserXgroup.userId,
      recipientGroupId: chatUserXgroup.idno,
      groupId: idno,
      senderId: fromUserId,
      messageId: newMsg.idno,
      isRead: 0
    };
  });
  let msgToBroadCast = msgRecipients[0]; // no matter receipientId, so i choose msgRecipients[0]
  msgToBroadCast.ChatMessage = newMsg;
  await db.ChatMessageRecipient.bulkCreate(msgRecipients);
  socket.broadcast
    .to(`group-${idno}`)
    .emit("my message", { msg: msgRecipients[0], chatType: "group" });
};

export default sendMessageToGroup;
