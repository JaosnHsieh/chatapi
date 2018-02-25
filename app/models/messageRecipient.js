module.exports = function(sequelize, DataTypes) {
  var ChatMessageRecipient = sequelize.define(
    "ChatMessageRecipient",
    {
      idno: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      recipientId: DataTypes.INTEGER,
      senderId: DataTypes.INTEGER,
      recipientGroupId: DataTypes.INTEGER,
      messageId: DataTypes.INTEGER,
      isRead: DataTypes.INTEGER
    },
    {
      classMethods: {
        associate: function(models) {
          ChatMessageRecipient.belongsTo(models.ChatMessage, {
            foreignKey: "messageId"
          });
        }
      }
    }
  );

  return ChatMessageRecipient;
};
