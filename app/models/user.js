
module.exports = function (sequelize, DataTypes) {

  var ChatUser = sequelize.define('ChatUser', {
     idno: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true 
    },
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    isActive:DataTypes.INTEGER 
  }, {
    classMethods: {
      associate: function (models) {
        
      }
    }
  }); 

  return ChatUser;
};

