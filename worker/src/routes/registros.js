import { Hono } from 'hono';
import { generarCodigoRegistro } from '../utils/codigoGenerator';
import { validarRegistro, validarRegistroUpdate } from '../utils/validaciones';

const registros = new Hono();

registros.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  const { error, value } = validarRegistro(body);
  if (error) return c.json({ error }, 400);

  const codigo_unico = generarCodigoRegistro();
  const now = new Date().toISOString();

  const creado = await c.env.DB.prepare(
    `INSERT INTO registros_entrada
       (codigo_unico, tipo_registro, descripcion, cantidad, unidad_medida, estado, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 'DISPONIBLE', ?, ?)
     RETURNING *`
  )
    .bind(codigo_unico, value.tipo_registro, value.descripcion, value.cantidad, value.unidad_medida, now, now)
    .first();

  return c.json(creado, 201);
});

registros.get('/', async (c) => {
  const tipo_registro = c.req.query('tipo_registro');
  const estado = c.req.query('estado');

  let sql = 'SELECT * FROM registros_entrada WHERE 1 = 1';
  const params = [];
  if (tipo_registro) {
    sql += ' AND tipo_registro = ?';
    params.push(tipo_registro);
  }
  if (estado) {
    sql += ' AND estado = ?';
    params.push(estado);
  }
  sql += ' ORDER BY createdAt DESC';

  const { results } = await c.env.DB.prepare(sql)
    .bind(...params)
    .all();
  return c.json(results);
});

registros.get('/:codigo', async (c) => {
  const registro = await c.env.DB.prepare('SELECT * FROM registros_entrada WHERE codigo_unico = ?')
    .bind(c.req.param('codigo'))
    .first();
  if (!registro) return c.json({ error: 'Registro no encontrado' }, 404);
  return c.json(registro);
});

registros.put('/:codigo', async (c) => {
  const codigo = c.req.param('codigo');
  const body = await c.req.json().catch(() => null);
  const { error, value } = validarRegistroUpdate(body);
  if (error) return c.json({ error }, 400);

  const existente = await c.env.DB.prepare('SELECT id FROM registros_entrada WHERE codigo_unico = ?')
    .bind(codigo)
    .first();
  if (!existente) return c.json({ error: 'Registro no encontrado' }, 404);

  const campos = Object.keys(value);
  const asignaciones = campos.map((campo) => `${campo} = ?`).join(', ');
  const params = campos.map((campo) => value[campo]);
  const now = new Date().toISOString();

  const actualizado = await c.env.DB.prepare(
    `UPDATE registros_entrada SET ${asignaciones}, updatedAt = ? WHERE codigo_unico = ? RETURNING *`
  )
    .bind(...params, now, codigo)
    .first();

  return c.json(actualizado);
});

export default registros;
