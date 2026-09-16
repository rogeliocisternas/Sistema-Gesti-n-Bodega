import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import registros from './routes/registros';
import trabajadores from './routes/trabajadores';
import asignaciones from './routes/asignaciones';

const app = new Hono();

app.use('*', secureHeaders());
app.use('/api/*', cors());

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.route('/api/registros', registros);
app.route('/api/trabajadores', trabajadores);
app.route('/api/asignaciones', asignaciones);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Error interno del servidor' }, 500);
});

export default app;
