module.exports = (sequelize, DataTypes) => sequelize.define('project', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4(),
    primaryKey: true,
    allowNull: false
  }
});
