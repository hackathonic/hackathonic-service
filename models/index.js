const fs = require('fs');
const models = {};
const Sequelize = require('sequelize');
const sequelize = require('../sequelize');

fs
.readdirSync('./models')
.filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
.forEach(modelName => {
  models[modelName.replace('.js', '')] = sequelize.import(`./${modelName}`);
});

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

models.Project.belongsTo(models.Hackathon);
models.Hackathon.hasMany(models.Project);

models.Project.belongsTo(models.Team);
models.Team.hasMany(models.Project);

models.Team.hasMany(models.Person);
models.Person.belongsToMany(models.Team, {
  through: 'Membership'
});

module.exports = models;
