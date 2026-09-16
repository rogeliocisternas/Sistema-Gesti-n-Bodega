const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trabajador = sequelize.define(
  'Trabajador',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rut: { type: DataTypes.STRING(12), unique: true, allowNull: false },
    nombres: { type: DataTypes.STRING(100), allowNull: false },
    apellidos: { type: DataTypes.STRING(100), allowNull: false },
    cargo: { type: DataTypes.STRING(100), allowNull: true },
    departamento: { type: DataTypes.STRING(100), allowNull: true },
    email: { type: DataTypes.STRING(150), allowNull: true, validate: { isEmail: true } },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { timestamps: true, tableName: 'trabajadores' }
);

module.exports = Trabajador;
