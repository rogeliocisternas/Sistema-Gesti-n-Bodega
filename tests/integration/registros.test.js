const request = require('supertest');
const crearApp = require('../../src/app');
const sequelize = require('../../src/config/database');

const app = crearApp();

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/registros', () => {
  test('crea un registro con código único generado automáticamente', async () => {
    const res = await request(app)
      .post('/api/registros')
      .send({ tipo_registro: 'MATERIAL', descripcion: 'Tornillos 3/8', cantidad: 100 });

    expect(res.status).toBe(201);
    expect(res.body.codigo_unico).toMatch(/^REG-\d{8}-\d{5}$/);
    expect(res.body.estado).toBe('DISPONIBLE');
  });

  test('rechaza un registro sin descripción (validación en tiempo real, RF-02)', async () => {
    const res = await request(app)
      .post('/api/registros')
      .send({ tipo_registro: 'MATERIAL', cantidad: 5 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('rechaza cantidad negativa', async () => {
    const res = await request(app)
      .post('/api/registros')
      .send({ tipo_registro: 'EQUIPO', descripcion: 'Taladro', cantidad: -1 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/registros', () => {
  test('lista los registros creados', async () => {
    const res = await request(app).get('/api/registros');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('filtra por tipo_registro', async () => {
    await request(app)
      .post('/api/registros')
      .send({ tipo_registro: 'DOCUMENTO', descripcion: 'Contrato arriendo', cantidad: 1 });

    const res = await request(app).get('/api/registros?tipo_registro=DOCUMENTO');
    expect(res.status).toBe(200);
    expect(res.body.every(r => r.tipo_registro === 'DOCUMENTO')).toBe(true);
  });
});

describe('GET /api/registros/:codigo', () => {
  test('consulta pública por código único (portal web, OE-3)', async () => {
    const creado = await request(app)
      .post('/api/registros')
      .send({ tipo_registro: 'OTRO', descripcion: 'Caja herramientas', cantidad: 2 });

    const res = await request(app).get(`/api/registros/${creado.body.codigo_unico}`);
    expect(res.status).toBe(200);
    expect(res.body.codigo_unico).toBe(creado.body.codigo_unico);
  });

  test('devuelve 404 si el código no existe', async () => {
    const res = await request(app).get('/api/registros/REG-00000000-99999');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/registros/:id', () => {
  test('actualiza un registro existente', async () => {
    const creado = await request(app)
      .post('/api/registros')
      .send({ tipo_registro: 'MATERIAL', descripcion: 'Cemento', cantidad: 20 });

    const res = await request(app)
      .put(`/api/registros/${creado.body.id}`)
      .send({ tipo_registro: 'MATERIAL', descripcion: 'Cemento gris', cantidad: 25 });

    expect(res.status).toBe(200);
    expect(res.body.descripcion).toBe('Cemento gris');
    expect(Number(res.body.cantidad)).toBe(25);
  });

  test('devuelve 404 al actualizar un id inexistente', async () => {
    const res = await request(app)
      .put('/api/registros/99999')
      .send({ tipo_registro: 'MATERIAL', descripcion: 'X', cantidad: 1 });
    expect(res.status).toBe(404);
  });
});
