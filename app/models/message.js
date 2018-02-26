module.exports = function(sequelize, DataTypes) {
  var ChatMessage = sequelize.define(
    "ChatMessage",
    {
      idno: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      subject: DataTypes.STRING,
      messageBody: DataTypes.STRING,
      creatorId: DataTypes.INTEGER,
      parentMessageId: DataTypes.INTEGER,
      expiryDate: DataTypes.DATE,
      isActive: DataTypes.INTEGER
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      classMethods: {
        associate: function(models) {
          ChatMessage.hasMany(models.ChatMessageRecipient, {
            foreignKey: "messageId",
            constraints: false
          });
        }
      }
    }
  );

  return ChatMessage;
};
