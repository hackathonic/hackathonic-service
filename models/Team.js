module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('team', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4(),
      primaryKey: true,
      allowNull: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });

  return Team;
};
