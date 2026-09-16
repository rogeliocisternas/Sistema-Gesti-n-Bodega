const request = require('supertest');
const crearApp = require('../../src/app');
const { sequelize, Trabajador } = require('../../src/models');

const app = crearApp();

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterEach(async () => {
  await Trabajador.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/trabajadores', () => {
  test('crea un trabajador válido', async () => {
    const res = await request(app).post('/api/trabajadores').send({
      rut: '15899839-4',
      nombres: 'Rogelio',
      apellidos: 'Cisternas',
      cargo: 'Bodeguero',
      email: 'rogelio@example.com',
    });

    expect(res.status).toBe(201);
    expect(res.body.rut).toBe('15899839-4');
    expect(res.body.activo).toBe(true);
  });

  test('devuelve 400 con un RUT de formato inválido', async () => {
    const res = await request(app).post('/api/trabajadores').send({
      rut: '158998394',
      nombres: 'Rogelio',
      apellidos: 'Cisternas',
    });
    expect(res.status).toBe(400);
  });

  test('crea un trabajador sin email, cargo ni departamento (campos opcionales vacíos)', async () => {
    const res = await request(app).post('/api/trabajadores').send({
      rut: '33333333-3',
      nombres: 'Ana',
      apellidos: 'Soto',
      cargo: '',
      departamento: '',
      email: '',
    });

    expect(res.status).toBe(201);
    expect(res.body.email).toBeNull();
  });

  test('devuelve 409 cuando el RUT ya está registrado', async () => {
    await request(app).post('/api/trabajadores').send({
      rut: '15899839-4',
      nombres: 'Rogelio',
      apellidos: 'Cisternas',
    });

    const res = await request(app).post('/api/trabajadores').send({
      rut: '15899839-4',
      nombres: 'Otro',
      apellidos: 'Trabajador',
    });

    expect(res.status).toBe(409);
  });
});

describe('GET /api/trabajadores', () => {
  test('lista los trabajadores registrados', async () => {
    await request(app).post('/api/trabajadores').send({
      rut: '11111111-1',
      nombres: 'Ana',
      apellidos: 'Soto',
    });

    const res = await request(app).get('/api/trabajadores');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/trabajadores/:rut', () => {
  test('obtiene un trabajador por RUT', async () => {
    await request(app).post('/api/trabajadores').send({
      rut: '22222222-2',
      nombres: 'Pedro',
      apellidos: 'Perez',
    });

    const res = await request(app).get('/api/trabajadores/22222222-2');
    expect(res.status).toBe(200);
    expect(res.body.nombres).toBe('Pedro');
  });

  test('devuelve 404 si el RUT no existe', async () => {
    const res = await request(app).get('/api/trabajadores/99999999-9');
    expect(res.status).toBe(404);
  });
});
