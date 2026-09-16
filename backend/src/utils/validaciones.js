const Joi = require('joi');

const registroSchema = Joi.object({
  tipo_registro: Joi.string().valid('MATERIAL', 'EQUIPO', 'DOCUMENTO', 'OTRO').required(),
  descripcion: Joi.string().min(3).max(1000).required(),
  cantidad: Joi.number().positive().required(),
  unidad_medida: Joi.string().max(20).optional(),
});

const registroUpdateSchema = Joi.object({
  tipo_registro: Joi.string().valid('MATERIAL', 'EQUIPO', 'DOCUMENTO', 'OTRO').optional(),
  descripcion: Joi.string().min(3).max(1000).optional(),
  cantidad: Joi.number().positive().optional(),
  unidad_medida: Joi.string().max(20).optional(),
  estado: Joi.string().valid('DISPONIBLE', 'ASIGNADO', 'EN_MANTENIMIENTO', 'BAJA').optional(),
}).min(1);

const rutRegex = /^[0-9]{7,8}-[0-9kK]$/;

const trabajadorSchema = Joi.object({
  rut: Joi.string().pattern(rutRegex).required().messages({
    'string.pattern.base': 'El RUT debe tener el formato 12345678-9',
  }),
  nombres: Joi.string().min(2).max(100).required(),
  apellidos: Joi.string().min(2).max(100).required(),
  cargo: Joi.string().max(100).optional().allow(''),
  departamento: Joi.string().max(100).optional().allow(''),
  email: Joi.string().email({ tlds: false }).optional().allow(''),
});

const asignacionSchema = Joi.object({
  registroId: Joi.number().integer().positive().required(),
  trabajadorId: Joi.number().integer().positive().required(),
  // Se valida como texto (no Joi.date()) para preservar el valor YYYY-MM-DD tal cual
  // y evitar que la conversión a Date/DATEONLY corra la fecha un día por huso horario.
  fecha_estimada_devolucion: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({ 'string.pattern.base': 'La fecha estimada de devolución debe tener el formato YYYY-MM-DD' }),
  observaciones: Joi.string().max(1000).optional().allow(''),
});

module.exports = {
  registroSchema,
  registroUpdateSchema,
  trabajadorSchema,
  asignacionSchema,
  rutRegex,
};
