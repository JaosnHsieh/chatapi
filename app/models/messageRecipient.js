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
      charset: "utf8",
      collate: "utf8_general_ci",
      classMethods: {
        associate: function(models) {
          ChatMessageRecipient.belongsTo(models.ChatMessage, {
            foreignKey: "messageId",
            constraints: false
          });
        }
      }
    }
  );

  return ChatMessageRecipient;
};
