
module.exports = function (sequelize, DataTypes) {

  var User = sequelize.define('User', {
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

  return User;
};

