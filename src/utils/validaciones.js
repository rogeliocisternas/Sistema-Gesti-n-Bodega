const Joi = require('joi');

const registroSchema = Joi.object({
  tipo_registro: Joi.string().valid('MATERIAL', 'EQUIPO', 'DOCUMENTO', 'OTRO').required(),
  descripcion: Joi.string().min(1).max(500).required(),
  cantidad: Joi.number().positive().required(),
  unidad_medida: Joi.string().max(20).optional()
});

const trabajadorSchema = Joi.object({
  rut: Joi.string().pattern(/^[0-9]{7,8}-[0-9kK]{1}$/).required()
    .messages({ 'string.pattern.base': 'RUT debe tener formato 12345678-9' }),
  nombre_completo: Joi.string().min(3).max(150).required(),
  email: Joi.string().email().required(),
  departamento: Joi.string().max(80).optional(),
  cargo: Joi.string().max(80).optional()
});

const asignacionSchema = Joi.object({
  registroId: Joi.number().integer().positive().required(),
  trabajadorId: Joi.number().integer().positive().required(),
  fecha_estimada_devolucion: Joi.date().greater('now').required()
});

module.exports = { registroSchema, trabajadorSchema, asignacionSchema };
