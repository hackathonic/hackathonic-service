const CONSTS = require('../consts');

module.exports = (sequelize, DataTypes) => sequelize.define('hackathon', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4(),
    primaryKey: true,
    allowNull: false
  },
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  stage: {
    type: DataTypes.ENUM(
      CONSTS.STAGE_UNLISTED,
      CONSTS.STAGE_REGISTRATION,
      CONSTS.STAGE_RUNNING,
      CONSTS.STAGE_STOPPED,
      CONSTS.STAGE_VOTING,
      CONSTS.STAGE_COMPLETED
    ),
    defaultValue: CONSTS.STAGE_UNLISTED
  }
}, {
  validate: {
    startDateBeforeEndDate () {
      if (this.startDate >= this.endDate) {
        throw new Error('startDate needs to be set before endDate.');
      }
    }
  },
  classMethods: {
    findByOwnerId: function (ownerId) {
      return this.findOne({
        where: { ownerId }
      });
    }
  }
});
