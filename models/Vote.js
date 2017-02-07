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
  }
}, {
  indexes: [{
    name: 'person_vote_for_project',
    unique: true,
    fields: ['projectId', 'personId']
  }]
});
