module.exports = function(sequelize, DataTypes) {
  var ChatUserXgroup = sequelize.define(
    "ChatUserXgroup",
    {
      idno: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: DataTypes.INTEGER,
      groupId: DataTypes.INTEGER,
      isActive: DataTypes.INTEGER
    },
    {
      classMethods: {
        associate: function(models) {}
      }
    }
  );

  return ChatUserXgroup;
};
