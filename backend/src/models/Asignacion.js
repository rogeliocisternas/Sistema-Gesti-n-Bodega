const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asignacion = sequelize.define(
  'Asignacion',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    codigo_unico: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    registroId: { type: DataTypes.INTEGER, allowNull: false },
    trabajadorId: { type: DataTypes.INTEGER, allowNull: false },
    fecha_asignacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    fecha_estimada_devolucion: { type: DataTypes.DATEONLY, allowNull: false },
    fecha_devolucion_real: { type: DataTypes.DATE, allowNull: true },
    estado: {
      type: DataTypes.ENUM('ASIGNADO', 'DEVUELTO'),
      defaultValue: 'ASIGNADO',
    },
    observaciones: { type: DataTypes.TEXT, allowNull: true },
  },
  { timestamps: true, tableName: 'asignaciones' }
);

module.exports = Asignacion;
