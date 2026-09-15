const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Registro = require('./Registro');
const Trabajador = require('./Trabajador');

const Asignacion = sequelize.define('Asignacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo_asignacion: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  fecha_asignacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_estimada_devolucion: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('ACTIVA', 'DEVUELTA', 'ATRASADA'),
    defaultValue: 'ACTIVA'
  }
}, {
  timestamps: true,
  tableName: 'asignaciones'
});

// Relaciones (Sección 8.2.3 del informe: ASIGNACIÓN depende de
// REGISTRO_DE_ENTRADA y TRABAJADOR - entidad débil).
Registro.hasMany(Asignacion, { foreignKey: 'registroId' });
Asignacion.belongsTo(Registro, { foreignKey: 'registroId' });

Trabajador.hasMany(Asignacion, { foreignKey: 'trabajadorId' });
Asignacion.belongsTo(Trabajador, { foreignKey: 'trabajadorId' });

module.exports = Asignacion;
