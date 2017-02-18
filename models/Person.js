module.exports = (sequelize, DataTypes) => sequelize.define('person', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    len: [2, 100]
  },
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4(),
    primaryKey: true,
    allowNull: false
  },
  githubId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['githubId']
    }
  ]
});
