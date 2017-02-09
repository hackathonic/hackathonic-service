module.exports = (sequelize, DataTypes) => sequelize.define('vote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4(),
    primaryKey: true,
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    validate: { min: 0, max: 10 }
  },
  projectId: {
    type: DataTypes.UUID,
    unique: {
      name: 'vote',
      msg: 'Already voted on this project'
    }
  },
  personId: {
    type: DataTypes.UUID,
    unique: {
      name: 'vote',
      msg: 'Already voted on this project'
    }
  }
});
