import { Hono } from 'hono';
import { validarTrabajador } from '../utils/validaciones';
import { serializarTrabajador } from '../utils/serializadores';

const trabajadores = new Hono();

trabajadores.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  const { error, value } = validarTrabajador(body);
  if (error) return c.json({ error }, 400);

  const existente = await c.env.DB.prepare('SELECT id FROM trabajadores WHERE rut = ?').bind(value.rut).first();
  if (existente) return c.json({ error: 'Ya existe un trabajador con ese RUT' }, 409);

  const now = new Date().toISOString();
  const creado = await c.env.DB.prepare(
    `INSERT INTO trabajadores (rut, nombres, apellidos, cargo, departamento, email, activo, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
     RETURNING *`
  )
    .bind(value.rut, value.nombres, value.apellidos, value.cargo, value.departamento, value.email, now, now)
    .first();

  return c.json(serializarTrabajador(creado), 201);
});

trabajadores.get('/', async (c) => {
  const activo = c.req.query('activo');
  let sql = 'SELECT * FROM trabajadores WHERE 1 = 1';
  const params = [];
  if (activo !== undefined) {
    sql += ' AND activo = ?';
    params.push(activo === 'true' ? 1 : 0);
  }
  sql += ' ORDER BY apellidos ASC';

  const { results } = await c.env.DB.prepare(sql)
    .bind(...params)
    .all();
  return c.json(results.map(serializarTrabajador));
});

trabajadores.get('/:rut', async (c) => {
  const trabajador = await c.env.DB.prepare('SELECT * FROM trabajadores WHERE rut = ?')
    .bind(c.req.param('rut'))
    .first();
  if (!trabajador) return c.json({ error: 'Trabajador no encontrado' }, 404);
  return c.json(serializarTrabajador(trabajador));
});

export default trabajadores;
