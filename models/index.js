const fs = require('fs');
const path = require('path');
const models = {};
const Sequelize = require('sequelize');
const database = require('../lib/database');

fs
.readdirSync(__dirname)
.filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
.forEach(modelName => {
  models[modelName.replace('.js', '')] = database.import(path.join(__dirname, modelName));
});

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = database;
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
