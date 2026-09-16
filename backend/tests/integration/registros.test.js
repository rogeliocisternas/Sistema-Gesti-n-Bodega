const request = require('supertest');
const crearApp = require('../../src/app');
const { sequelize, Registro } = require('../../src/models');

const app = crearApp();

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterEach(async () => {
  await Registro.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/registros', () => {
  test('crea un registro con código único y estado DISPONIBLE', async () => {
    const res = await request(app).post('/api/registros').send({
      tipo_registro: 'MATERIAL',
      descripcion: 'Cemento en sacos',
      cantidad: 20,
      unidad_medida: 'SACO',
    });

    expect(res.status).toBe(201);
    expect(res.body.codigo_unico).toMatch(/^REG-\d{8}-[0-9A-Z]{5}$/);
    expect(res.body.estado).toBe('DISPONIBLE');
  });

  test('devuelve 400 cuando faltan campos requeridos', async () => {
    const res = await request(app).post('/api/registros').send({ tipo_registro: 'MATERIAL' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('devuelve 400 cuando el tipo_registro no es válido', async () => {
    const res = await request(app).post('/api/registros').send({
      tipo_registro: 'NO_EXISTE',
      descripcion: 'Algo',
      cantidad: 1,
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/registros', () => {
  test('lista los registros creados', async () => {
    await request(app).post('/api/registros').send({
      tipo_registro: 'EQUIPO',
      descripcion: 'Taladro percutor',
      cantidad: 1,
    });

    const res = await request(app).get('/api/registros');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('filtra por tipo_registro', async () => {
    await request(app).post('/api/registros').send({
      tipo_registro: 'DOCUMENTO',
      descripcion: 'Contrato de arriendo',
      cantidad: 1,
    });
    await request(app).post('/api/registros').send({
      tipo_registro: 'MATERIAL',
      descripcion: 'Fierro',
      cantidad: 5,
    });

    const res = await request(app).get('/api/registros?tipo_registro=DOCUMENTO');
    expect(res.status).toBe(200);
    expect(res.body.every((r) => r.tipo_registro === 'DOCUMENTO')).toBe(true);
  });
});

describe('GET /api/registros/:codigo', () => {
  test('obtiene un registro existente por código', async () => {
    const creado = await request(app).post('/api/registros').send({
      tipo_registro: 'OTRO',
      descripcion: 'Caja de herramientas',
      cantidad: 3,
    });

    const res = await request(app).get(`/api/registros/${creado.body.codigo_unico}`);
    expect(res.status).toBe(200);
    expect(res.body.codigo_unico).toBe(creado.body.codigo_unico);
  });

  test('devuelve 404 si el código no existe', async () => {
    const res = await request(app).get('/api/registros/REG-00000000-XXXXX');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/registros/:codigo', () => {
  test('actualiza un registro existente', async () => {
    const creado = await request(app).post('/api/registros').send({
      tipo_registro: 'MATERIAL',
      descripcion: 'Pintura',
      cantidad: 4,
    });

    const res = await request(app)
      .put(`/api/registros/${creado.body.codigo_unico}`)
      .send({ estado: 'EN_MANTENIMIENTO' });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('EN_MANTENIMIENTO');
  });

  test('devuelve 404 al actualizar un código inexistente', async () => {
    const res = await request(app)
      .put('/api/registros/REG-00000000-XXXXX')
      .send({ estado: 'BAJA' });
    expect(res.status).toBe(404);
  });

  test('devuelve 400 cuando el cuerpo de actualización está vacío', async () => {
    const creado = await request(app).post('/api/registros').send({
      tipo_registro: 'MATERIAL',
      descripcion: 'Pintura',
      cantidad: 4,
    });

    const res = await request(app).put(`/api/registros/${creado.body.codigo_unico}`).send({});
    expect(res.status).toBe(400);
  });
});
