const { Sequelize } = require('sequelize');

// SQLite en memoria: suficiente para el prototipo del TAP.
// En producción esto sería PostgreSQL, según lo definido en la
// Sección 8.2 (Descripción Detallada de la Solución) del informe.
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

module.exports = sequelize;
