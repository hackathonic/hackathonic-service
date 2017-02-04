module.exports = (sequelize, DataTypes) => sequelize.define('hackathon', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE
}, {
  validate: {
    startDateBeforeEndDate () {
      if (this.startDate >= this.endDate) {
        throw new Error('startDate needs to be set before endDate.');
      }
    }
  }
});
