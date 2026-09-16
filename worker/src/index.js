import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import registros from './routes/registros';
import trabajadores from './routes/trabajadores';
import asignaciones from './routes/asignaciones';
import mermas from './routes/mermas';

const app = new Hono();

app.use('*', secureHeaders());
app.use('/api/*', cors());

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.route('/api/registros', registros);
app.route('/api/trabajadores', trabajadores);
app.route('/api/asignaciones', asignaciones);
app.route('/api/mermas', mermas);

// Cloudflare solo aplica `not_found_handling` (fallback de SPA a index.html) para peticiones
// que nunca llegan a este Worker. Como tenemos un script `main`, cualquier ruta que no matchee
// un archivo estático (p. ej. /mermas, /dashboard) SÍ llega aquí — hay que reenviarla
// explícitamente al binding de assets para que sirva el index.html de la SPA.
app.get('*', async (c) => {
  const respuesta = await c.env.ASSETS.fetch(c.req.raw);
  // La respuesta de ASSETS.fetch() trae headers inmutables; se envuelve en una nueva
  // Response para que secureHeaders() pueda añadir sus cabeceras sin lanzar TypeError.
  return new Response(respuesta.body, respuesta);
});

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Error interno del servidor' }, 500);
});

export default app;
