
module.exports = function (sequelize, DataTypes) {

  var Message = sequelize.define('Message', {
    subject: DataTypes.STRING,
    messageBody: DataTypes.STRING,
    creatorId: DataTypes.INTEGER,
    parentMessageId: DataTypes.INTEGER,
    expiryDate:DataTypes.DATE,
    isActive:DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) {
        
      }
    }
  }); 

  return Message;
};

