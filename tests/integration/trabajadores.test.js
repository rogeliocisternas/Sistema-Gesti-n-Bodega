const request = require('supertest');
const crearApp = require('../../src/app');
const sequelize = require('../../src/config/database');

const app = crearApp();

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await request(app)
    .post('/api/trabajadores')
    .send({ rut: '22222222-2', nombre_completo: 'Pedro Ríos', email: 'pedro@empresa.cl' });
});

afterAll(async () => {
  await sequelize.close();
});

describe('GET /api/trabajadores', () => {
  test('lista los trabajadores registrados', async () => {
    const res = await request(app).get('/api/trabajadores');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/trabajadores/:rut', () => {
  test('consulta por RUT (portal web, OE-3)', async () => {
    const res = await request(app).get('/api/trabajadores/22222222-2');
    expect(res.status).toBe(200);
    expect(res.body.nombre_completo).toBe('Pedro Ríos');
  });

  test('devuelve 404 si el RUT no existe', async () => {
    const res = await request(app).get('/api/trabajadores/99999999-9');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/trabajadores', () => {
  test('rechaza payload inválido (email mal formado)', async () => {
    const res = await request(app)
      .post('/api/trabajadores')
      .send({ rut: '33333333-3', nombre_completo: 'Carla Díaz', email: 'no-valido' });
    expect(res.status).toBe(400);
  });
});

describe('GET /health', () => {
  test('responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
