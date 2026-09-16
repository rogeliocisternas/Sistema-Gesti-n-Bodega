const { Asignacion, Registro, Trabajador } = require('../models');
const { asignacionSchema } = require('../utils/validaciones');
const { generarCodigoAsignacion } = require('../utils/codigoGenerator');

async function crear(req, res, next) {
  try {
    const { error, value } = asignacionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const registro = await Registro.findByPk(value.registroId);
    if (!registro) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    const trabajador = await Trabajador.findByPk(value.trabajadorId);
    if (!trabajador) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    if (registro.estado !== 'DISPONIBLE') {
      return res.status(409).json({ error: 'El registro ya se encuentra asignado' });
    }

    const codigo_unico = generarCodigoAsignacion();
    const asignacion = await Asignacion.create({ ...value, codigo_unico });
    await registro.update({ estado: 'ASIGNADO' });

    return res.status(201).json(asignacion);
  } catch (err) {
    return next(err);
  }
}

async function listarPorTrabajador(req, res, next) {
  try {
    const trabajador = await Trabajador.findByPk(req.params.id);
    if (!trabajador) {
      return res.status(404).json({ error: 'Trabajador no encontrado' });
    }

    const asignaciones = await Asignacion.findAll({
      where: { trabajadorId: req.params.id },
      include: [{ model: Registro, as: 'registro' }],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json(asignaciones);
  } catch (err) {
    return next(err);
  }
}

async function devolver(req, res, next) {
  try {
    const asignacion = await Asignacion.findByPk(req.params.id);
    if (!asignacion) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    if (asignacion.estado === 'DEVUELTO') {
      return res.status(409).json({ error: 'La asignación ya fue devuelta' });
    }

    await asignacion.update({ estado: 'DEVUELTO', fecha_devolucion_real: new Date() });

    const registro = await Registro.findByPk(asignacion.registroId);
    if (registro) {
      await registro.update({ estado: 'DISPONIBLE' });
    }

    return res.status(200).json(asignacion);
  } catch (err) {
    return next(err);
  }
}

module.exports = { crear, listarPorTrabajador, devolver };
