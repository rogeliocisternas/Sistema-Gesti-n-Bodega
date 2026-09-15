const Trabajador = require('../models/Trabajador');
const { trabajadorSchema } = require('../utils/validaciones');

async function crearTrabajador(req, res) {
  const { error, value } = trabajadorSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const existe = await Trabajador.findOne({ where: { rut: value.rut } });
  if (existe) {
    return res.status(409).json({ error: 'RUT ya registrado' });
  }
  const trabajador = await Trabajador.create(value);
  return res.status(201).json(trabajador);
}

async function listarTrabajadores(req, res) {
  const trabajadores = await Trabajador.findAll();
  return res.status(200).json(trabajadores);
}

async function obtenerTrabajadorPorRut(req, res) {
  const trabajador = await Trabajador.findOne({ where: { rut: req.params.rut } });
  if (!trabajador) {
    return res.status(404).json({ error: 'Trabajador no encontrado' });
  }
  return res.status(200).json(trabajador);
}

module.exports = { crearTrabajador, listarTrabajadores, obtenerTrabajadorPorRut };
