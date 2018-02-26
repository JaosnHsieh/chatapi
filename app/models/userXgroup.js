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
      charset: "utf8",
      collate: "utf8_general_ci",
      classMethods: {
        associate: function(models) {
          ChatUserXgroup.belongsTo(models.ChatUser, {
            foreignKey: "userId",
            constraints: false
          });
          ChatUserXgroup.belongsTo(models.ChatGroup, {
            foreignKey: "groupId",
            constraints: false
          });
        }
      }
    }
  );

  return ChatUserXgroup;
};
