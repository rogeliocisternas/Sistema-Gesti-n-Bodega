const { Registro } = require('../models');
const { registroSchema, registroUpdateSchema } = require('../utils/validaciones');
const { generarCodigoRegistro } = require('../utils/codigoGenerator');

async function crear(req, res, next) {
  try {
    const { error, value } = registroSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const codigo_unico = generarCodigoRegistro();
    const registro = await Registro.create({ ...value, codigo_unico });
    return res.status(201).json(registro);
  } catch (err) {
    return next(err);
  }
}

async function listar(req, res, next) {
  try {
    const where = {};
    if (req.query.tipo_registro) where.tipo_registro = req.query.tipo_registro;
    if (req.query.estado) where.estado = req.query.estado;

    const registros = await Registro.findAll({ where, order: [['createdAt', 'DESC']] });
    return res.status(200).json(registros);
  } catch (err) {
    return next(err);
  }
}

async function obtenerPorCodigo(req, res, next) {
  try {
    const registro = await Registro.findOne({ where: { codigo_unico: req.params.codigo } });
    if (!registro) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    return res.status(200).json(registro);
  } catch (err) {
    return next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const { error, value } = registroUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const registro = await Registro.findOne({ where: { codigo_unico: req.params.codigo } });
    if (!registro) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    await registro.update(value);
    return res.status(200).json(registro);
  } catch (err) {
    return next(err);
  }
}

module.exports = { crear, listar, obtenerPorCodigo, actualizar };
