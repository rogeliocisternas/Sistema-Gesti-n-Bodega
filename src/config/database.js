const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const isProduction = process.env.NODE_ENV === 'production';
const dbPath = process.env.DB_PATH || (isProduction ? './data/gestion-bodega.sqlite' : ':memory:');

if (dbPath !== ':memory:') {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

module.exports = sequelize;
