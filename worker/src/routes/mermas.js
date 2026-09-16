import { Hono } from 'hono';
import { generarCodigoMerma } from '../utils/codigoGenerator';
import { validarMerma } from '../utils/validaciones';

const mermas = new Hono();

function serializarFila(fila) {
  return {
    id: fila.id,
    codigo_unico: fila.codigo_unico,
    registroId: fila.registroId,
    cantidad: fila.cantidad,
    motivo: fila.motivo,
    reportado_por: fila.reportado_por,
    estado: fila.estado,
    evidencia_url: fila.evidencia_url,
    createdAt: fila.createdAt,
    updatedAt: fila.updatedAt,
    registro: {
      id: fila.registroId,
      codigo_unico: fila.reg_codigo_unico,
      tipo_registro: fila.reg_tipo_registro,
      descripcion: fila.reg_descripcion,
    },
  };
}

mermas.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  const { error, value } = validarMerma(body);
  if (error) return c.json({ error }, 400);

  const registro = await c.env.DB.prepare('SELECT id FROM registros_entrada WHERE id = ?')
    .bind(value.registroId)
    .first();
  if (!registro) return c.json({ error: 'Registro no encontrado' }, 404);

  const codigo_unico = generarCodigoMerma();
  const now = new Date().toISOString();

  const creada = await c.env.DB.prepare(
    `INSERT INTO mermas
       (codigo_unico, registroId, cantidad, motivo, reportado_por, estado, evidencia_url, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 'PENDIENTE', ?, ?, ?)
     RETURNING *`
  )
    .bind(codigo_unico, value.registroId, value.cantidad, value.motivo, value.reportado_por, value.evidencia_url, now, now)
    .first();

  return c.json(creada, 201);
});

mermas.get('/', async (c) => {
  const estado = c.req.query('estado');
  let sql = `
    SELECT
      m.*,
      r.codigo_unico AS reg_codigo_unico, r.tipo_registro AS reg_tipo_registro, r.descripcion AS reg_descripcion
    FROM mermas m
    JOIN registros_entrada r ON r.id = m.registroId
    WHERE 1 = 1`;
  const params = [];
  if (estado) {
    sql += ' AND m.estado = ?';
    params.push(estado);
  }
  sql += ' ORDER BY m.createdAt DESC';

  const { results } = await c.env.DB.prepare(sql)
    .bind(...params)
    .all();
  return c.json(results.map(serializarFila));
});

async function cambiarEstado(c, nuevoEstado) {
  const id = c.req.param('id');
  const merma = await c.env.DB.prepare('SELECT * FROM mermas WHERE id = ?').bind(id).first();
  if (!merma) return c.json({ error: 'Merma no encontrada' }, 404);
  if (merma.estado !== 'PENDIENTE') {
    return c.json({ error: 'La merma ya fue revisada' }, 409);
  }

  const now = new Date().toISOString();
  const actualizada = await c.env.DB.prepare('UPDATE mermas SET estado = ?, updatedAt = ? WHERE id = ? RETURNING *')
    .bind(nuevoEstado, now, id)
    .first();

  return c.json(actualizada);
}

mermas.patch('/:id/aprobar', (c) => cambiarEstado(c, 'APROBADA'));
mermas.patch('/:id/rechazar', (c) => cambiarEstado(c, 'RECHAZADA'));

export default mermas;
