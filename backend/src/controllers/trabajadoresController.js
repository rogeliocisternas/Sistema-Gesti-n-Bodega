const { Trabajador } = require('../models');
const { trabajadorSchema } = require('../utils/validaciones');

async function crear(req, res, next) {
  try {
    const { error, value } = trabajadorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const existente = await Trabajador.findOne({ where: { rut: value.rut } });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un trabajador con ese RUT' });
    }

    const payload = { ...value };
    ['cargo', 'departamento', 'email'].forEach((campo) => {
      if (payload[campo] === '') payload[campo] = null;
    });

    const trabajador = await Trabajador.create(payload);
    return res.status(201).json(trabajador);
  } catch (err) {
    return next(err);
  }
}

async function listar(req, res, next) {
  try {
    const where = {};
    if (req.query.activo !== undefined) where.activo = req.query.activo === 'true';

    const trabajadores = await Trabajador.findAll({ where, order: [['apellidos', 'ASC']] });
    return res.status(200).json(trabajadores);
  } catch (err) {
    return next(err);
  }
}

async function obtenerPorRut(req, res, next) {
  try {
    const trabajador = await Trabajador.findOne({ where: { rut: req.params.rut } });
    if (!trabajador) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }
    return res.status(200).json(trabajador);
  } catch (err) {
    return next(err);
  }
}

module.exports = { crear, listar, obtenerPorRut };
