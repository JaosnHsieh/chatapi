
module.exports = function (sequelize, DataTypes) {

  var UserXgroup = sequelize.define('UserXgroup', {
    userId: DataTypes.INTEGER,
    groupId: DataTypes.INTEGER,
    isActive:DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) {
        
      }
    }
  }); 

  return UserXgroup;
};

