
module.exports = function (sequelize, DataTypes) {

  var Group = sequelize.define('Group', {
    name: DataTypes.STRING,
    isActive:DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) {
        
      }
    } 
  }); 

  return Group;
};

