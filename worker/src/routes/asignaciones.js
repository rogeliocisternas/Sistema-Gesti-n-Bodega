import { Hono } from 'hono';
import { generarCodigoAsignacion } from '../utils/codigoGenerator';
import { validarAsignacion } from '../utils/validaciones';

const asignaciones = new Hono();

function serializarConRegistro(fila) {
  return {
    id: fila.id,
    codigo_unico: fila.codigo_unico,
    registroId: fila.registroId,
    trabajadorId: fila.trabajadorId,
    fecha_asignacion: fila.fecha_asignacion,
    fecha_estimada_devolucion: fila.fecha_estimada_devolucion,
    fecha_devolucion_real: fila.fecha_devolucion_real,
    estado: fila.estado,
    observaciones: fila.observaciones,
    createdAt: fila.createdAt,
    updatedAt: fila.updatedAt,
    registro: {
      id: fila.registroId,
      codigo_unico: fila.reg_codigo_unico,
      tipo_registro: fila.reg_tipo_registro,
      descripcion: fila.reg_descripcion,
      cantidad: fila.reg_cantidad,
      unidad_medida: fila.reg_unidad_medida,
      estado: fila.reg_estado,
    },
  };
}

const SELECT_CON_REGISTRO = `
  SELECT
    a.id, a.codigo_unico, a.registroId, a.trabajadorId, a.fecha_asignacion,
    a.fecha_estimada_devolucion, a.fecha_devolucion_real, a.estado, a.observaciones,
    a.createdAt, a.updatedAt,
    r.codigo_unico AS reg_codigo_unico, r.tipo_registro AS reg_tipo_registro,
    r.descripcion AS reg_descripcion, r.cantidad AS reg_cantidad,
    r.unidad_medida AS reg_unidad_medida, r.estado AS reg_estado
  FROM asignaciones a
  JOIN registros_entrada r ON r.id = a.registroId`;

asignaciones.get('/', async (c) => {
  const estado = c.req.query('estado');
  let sql = `${SELECT_CON_REGISTRO} WHERE 1 = 1`;
  const params = [];
  if (estado) {
    sql += ' AND a.estado = ?';
    params.push(estado);
  }
  sql += ' ORDER BY a.createdAt DESC';

  const { results } = await c.env.DB.prepare(sql)
    .bind(...params)
    .all();
  return c.json(results.map(serializarConRegistro));
});

asignaciones.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  const { error, value } = validarAsignacion(body);
  if (error) return c.json({ error }, 400);

  const registro = await c.env.DB.prepare('SELECT * FROM registros_entrada WHERE id = ?')
    .bind(value.registroId)
    .first();
  if (!registro) return c.json({ error: 'Registro no encontrado' }, 404);

  const trabajador = await c.env.DB.prepare('SELECT id FROM trabajadores WHERE id = ?')
    .bind(value.trabajadorId)
    .first();
  if (!trabajador) return c.json({ error: 'Trabajador no encontrado' }, 404);

  if (registro.estado !== 'DISPONIBLE') {
    return c.json({ error: 'El registro ya se encuentra asignado' }, 409);
  }

  const codigo_unico = generarCodigoAsignacion();
  const now = new Date().toISOString();

  const creada = await c.env.DB.prepare(
    `INSERT INTO asignaciones
       (codigo_unico, registroId, trabajadorId, fecha_asignacion, fecha_estimada_devolucion, estado, observaciones, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 'ASIGNADO', ?, ?, ?)
     RETURNING *`
  )
    .bind(codigo_unico, value.registroId, value.trabajadorId, now, value.fecha_estimada_devolucion, value.observaciones, now, now)
    .first();

  await c.env.DB.prepare('UPDATE registros_entrada SET estado = ?, updatedAt = ? WHERE id = ?')
    .bind('ASIGNADO', now, value.registroId)
    .run();

  return c.json(creada, 201);
});

asignaciones.get('/trabajador/:id', async (c) => {
  const trabajadorId = c.req.param('id');

  const trabajador = await c.env.DB.prepare('SELECT id FROM trabajadores WHERE id = ?').bind(trabajadorId).first();
  if (!trabajador) return c.json({ error: 'Trabajador no encontrado' }, 404);

  const { results } = await c.env.DB.prepare(`${SELECT_CON_REGISTRO} WHERE a.trabajadorId = ? ORDER BY a.createdAt DESC`)
    .bind(trabajadorId)
    .all();

  return c.json(results.map(serializarConRegistro));
});

asignaciones.patch('/:id/devolver', async (c) => {
  const id = c.req.param('id');

  const asignacion = await c.env.DB.prepare('SELECT * FROM asignaciones WHERE id = ?').bind(id).first();
  if (!asignacion) return c.json({ error: 'Asignación no encontrada' }, 404);
  if (asignacion.estado === 'DEVUELTO') {
    return c.json({ error: 'La asignación ya fue devuelta' }, 409);
  }

  const now = new Date().toISOString();

  const actualizada = await c.env.DB.prepare(
    `UPDATE asignaciones SET estado = 'DEVUELTO', fecha_devolucion_real = ?, updatedAt = ? WHERE id = ? RETURNING *`
  )
    .bind(now, now, id)
    .first();

  await c.env.DB.prepare('UPDATE registros_entrada SET estado = ?, updatedAt = ? WHERE id = ?')
    .bind('DISPONIBLE', now, asignacion.registroId)
    .run();

  return c.json(actualizada);
});

export default asignaciones;
