module.exports = function (sequelize, DataTypes) {

  var ChatGroup = sequelize.define('ChatGroup', {
    idno: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true 
    },
    name: DataTypes.STRING,
    isActive: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function (models) {

      }
    }
  });

  return ChatGroup;
};
