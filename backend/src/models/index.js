const sequelize = require('../config/database');
const Registro = require('./Registro');
const Trabajador = require('./Trabajador');
const Asignacion = require('./Asignacion');

Registro.hasMany(Asignacion, { foreignKey: 'registroId', as: 'asignaciones' });
Asignacion.belongsTo(Registro, { foreignKey: 'registroId', as: 'registro' });

Trabajador.hasMany(Asignacion, { foreignKey: 'trabajadorId', as: 'asignaciones' });
Asignacion.belongsTo(Trabajador, { foreignKey: 'trabajadorId', as: 'trabajador' });

module.exports = { sequelize, Registro, Trabajador, Asignacion };
