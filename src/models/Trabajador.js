const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trabajador = sequelize.define('Trabajador', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rut: {
    type: DataTypes.STRING(12),
    unique: true,
    allowNull: false
  },
  nombre_completo: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { isEmail: true }
  },
  departamento: DataTypes.STRING(80),
  cargo: DataTypes.STRING(80),
  estado: {
    type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
    defaultValue: 'ACTIVO'
  }
}, {
  timestamps: true,
  tableName: 'trabajadores'
});

module.exports = Trabajador;
