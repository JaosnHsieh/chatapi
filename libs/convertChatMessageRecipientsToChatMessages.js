/**
 * @desc convert chatMessageRecipients data Array to Object and sort put chatMessageRecipient.ChatMessage to Object[receipentId]
 * @param Array chatMessageRecipientArray - chatMessageRecipients plain data query from sequelize
 * @return Object - ChatMessage data object, properties are receipentId
 */
const convertChatMessageRecipientsToChatMessages = (
  chatMessageRecipientArray,
  currentUser
) => {
  return chatMessageRecipientArray.reduce((result, ele) => {
    const { senderId, recipientId } = ele;
    if (senderId === currentUser.idno) {
      return {
        ...result,
        [recipientId]: result[`${recipientId}`]
          ? [...result[recipientId], ele.ChatMessage]
          : [ele.ChatMessage]
      };
    }
    return {
      ...result,
      [senderId]: result[`${senderId}`]
        ? [...result[senderId], ele.ChatMessage]
        : [ele.ChatMessage]
    };
  }, {});
};
export default convertChatMessageRecipientsToChatMessages;
