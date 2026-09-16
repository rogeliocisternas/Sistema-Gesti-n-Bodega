const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Registro = sequelize.define(
  'Registro',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    codigo_unico: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    tipo_registro: {
      type: DataTypes.ENUM('MATERIAL', 'EQUIPO', 'DOCUMENTO', 'OTRO'),
      allowNull: false,
    },
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    cantidad: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0.01 },
    },
    unidad_medida: { type: DataTypes.STRING(20), defaultValue: 'UNIDAD' },
    estado: {
      type: DataTypes.ENUM('DISPONIBLE', 'ASIGNADO', 'EN_MANTENIMIENTO', 'BAJA'),
      defaultValue: 'DISPONIBLE',
    },
  },
  { timestamps: true, tableName: 'registros_entrada' }
);

module.exports = Registro;
