
module.exports = function (sequelize, DataTypes) {

  var MessageRecipient = sequelize.define('MessageRecipient', {
    recipientId: DataTypes.INTEGER,
    recipientGroupId: DataTypes.INTEGER,
    messageId: DataTypes.INTEGER,
    isRead:DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) { 
        MessageRecipient.belongsTo(models.Message, { foreignKey: 'messageId' });
      }
    }
  }); 

  return MessageRecipient;
};

