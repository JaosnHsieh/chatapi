module.exports = function(sequelize, DataTypes) {
  var ChatUser = sequelize.define(
    "ChatUser",
    {
      idno: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      isActive: DataTypes.INTEGER
    },
    {
      classMethods: {
        associate: function(models) {}
      },
      instanceMethods: {
        toJSON: function() {
          var values = Object.assign({}, this.get());

          delete values.password;
          return values;
        }
      }
    }
  );

  return ChatUser;
};
