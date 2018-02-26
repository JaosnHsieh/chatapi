module.exports = function(sequelize, DataTypes) {
  var ChatGroup = sequelize.define(
    "ChatGroup",
    {
      idno: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      desc: DataTypes.STRING,
      isActive: DataTypes.INTEGER
    },
    {
      charset: "utf8",
      collate: "utf8_general_ci",
      classMethods: {
        associate: function(models) {
          ChatGroup.hasMany(models.ChatUserXgroup, {
            foreignKey: "groupId",
            constraints: false
          });
        }
      }
    }
  );

  return ChatGroup;
};
