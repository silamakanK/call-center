// config/dbSequelize.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('call_center', 'postgres', 'passer', {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = sequelize;
