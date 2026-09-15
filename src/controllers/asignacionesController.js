const Asignacion = require('../models/Asignacion');
const Registro = require('../models/Registro');
const Trabajador = require('../models/Trabajador');
const { asignacionSchema } = require('../utils/validaciones');
const { generarCodigoAsignacion } = require('../utils/codigoGenerator');

async function crearAsignacion(req, res) {
  const { error, value } = asignacionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const registro = await Registro.findByPk(value.registroId);
  if (!registro) {
    return res.status(404).json({ error: 'Registro no encontrado' });
  }
  if (registro.estado !== 'DISPONIBLE') {
    return res.status(409).json({ error: 'Registro no disponible para asignación' });
  }

  const trabajador = await Trabajador.findByPk(value.trabajadorId);
  if (!trabajador) {
    return res.status(404).json({ error: 'Trabajador no encontrado' });
  }

  const codigo_asignacion = generarCodigoAsignacion();
  const asignacion = await Asignacion.create({ ...value, codigo_asignacion });

  registro.estado = 'ASIGNADO';
  await registro.save();

  return res.status(201).json(asignacion);
}

async function listarAsignacionesPorTrabajador(req, res) {
  const asignaciones = await Asignacion.findAll({
    where: { trabajadorId: req.params.trabajadorId },
    include: [Registro, Trabajador]
  });
  return res.status(200).json(asignaciones);
}

async function devolverAsignacion(req, res) {
  const asignacion = await Asignacion.findByPk(req.params.id);
  if (!asignacion) {
    return res.status(404).json({ error: 'Asignación no encontrada' });
  }
  asignacion.estado = 'DEVUELTA';
  await asignacion.save();

  const registro = await Registro.findByPk(asignacion.registroId);
  if (registro) {
    registro.estado = 'DISPONIBLE';
    await registro.save();
  }

  return res.status(200).json(asignacion);
}

module.exports = { crearAsignacion, listarAsignacionesPorTrabajador, devolverAsignacion };
