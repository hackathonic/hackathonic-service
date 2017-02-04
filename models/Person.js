module.exports = (sequelize, DataTypes) => sequelize.define('person', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    len: [2, 100]
  },
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  }
},{
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
  ]
});