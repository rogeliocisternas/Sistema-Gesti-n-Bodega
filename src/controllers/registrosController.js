const Registro = require('../models/Registro');
const { registroSchema } = require('../utils/validaciones');
const { generarCodigoRegistro } = require('../utils/codigoGenerator');

async function crearRegistro(req, res) {
  const { error, value } = registroSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  let codigo_unico;
  let intento = 0;
  // Reintenta si hay colisión de código (extremadamente improbable, pero
  // cubierto por el requisito RF-01 de unicidad garantizada).
  do {
    codigo_unico = generarCodigoRegistro();
    intento++;
  } while (await Registro.findOne({ where: { codigo_unico } }) && intento < 5);

  const registro = await Registro.create({ ...value, codigo_unico });
  return res.status(201).json(registro);
}

async function listarRegistros(req, res) {
  const { tipo_registro, estado } = req.query;
  const where = {};
  if (tipo_registro) where.tipo_registro = tipo_registro;
  if (estado) where.estado = estado;
  const registros = await Registro.findAll({ where });
  return res.status(200).json(registros);
}

async function obtenerRegistroPorCodigo(req, res) {
  const registro = await Registro.findOne({ where: { codigo_unico: req.params.codigo } });
  if (!registro) {
    return res.status(404).json({ error: 'Registro no encontrado' });
  }
  return res.status(200).json(registro);
}

async function actualizarRegistro(req, res) {
  const registro = await Registro.findByPk(req.params.id);
  if (!registro) {
    return res.status(404).json({ error: 'Registro no encontrado' });
  }
  const { error, value } = registroSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  await registro.update(value);
  return res.status(200).json(registro);
}

module.exports = {
  crearRegistro,
  listarRegistros,
  obtenerRegistroPorCodigo,
  actualizarRegistro
};
