const MIN_POINTS = 0;
const MAX_POINTS = 10;

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
    validate: {
      isInt: true,
      min: MIN_POINTS,
      max: MAX_POINTS
    }
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
