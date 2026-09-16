const request = require('supertest');
const crearApp = require('../../src/app');
const { sequelize, Registro, Trabajador, Asignacion } = require('../../src/models');

const app = crearApp();

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterEach(async () => {
  await Asignacion.destroy({ where: {}, truncate: true });
  await Registro.destroy({ where: {}, truncate: true });
  await Trabajador.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
  await sequelize.close();
});

async function crearRegistro(overrides = {}) {
  const res = await request(app)
    .post('/api/registros')
    .send({
      tipo_registro: 'EQUIPO',
      descripcion: 'Notebook Dell',
      cantidad: 1,
      ...overrides,
    });
  return res.body;
}

async function crearTrabajador(overrides = {}) {
  const res = await request(app)
    .post('/api/trabajadores')
    .send({
      rut: '15899839-4',
      nombres: 'Rogelio',
      apellidos: 'Cisternas',
      ...overrides,
    });
  return res.body;
}

describe('POST /api/asignaciones', () => {
  test('asigna un registro disponible a un trabajador y cambia su estado a ASIGNADO', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    const res = await request(app).post('/api/asignaciones').send({
      registroId: registro.id,
      trabajadorId: trabajador.id,
      fecha_estimada_devolucion: '2026-12-01',
    });

    expect(res.status).toBe(201);
    expect(res.body.codigo_unico).toMatch(/^ASIG-\d{8}-[0-9A-Z]{5}$/);
    expect(res.body.estado).toBe('ASIGNADO');

    const registroActualizado = await request(app).get(`/api/registros/${registro.codigo_unico}`);
    expect(registroActualizado.body.estado).toBe('ASIGNADO');
  });

  test('conserva exactamente la fecha estimada de devolución (sin corrimiento de huso horario)', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    const res = await request(app).post('/api/asignaciones').send({
      registroId: registro.id,
      trabajadorId: trabajador.id,
      fecha_estimada_devolucion: '2026-01-12',
    });

    expect(res.status).toBe(201);
    expect(res.body.fecha_estimada_devolucion).toBe('2026-01-12');
  });

  test('devuelve 409 si el registro ya está asignado', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    await request(app).post('/api/asignaciones').send({
      registroId: registro.id,
      trabajadorId: trabajador.id,
      fecha_estimada_devolucion: '2026-12-01',
    });

    const res = await request(app).post('/api/asignaciones').send({
      registroId: registro.id,
      trabajadorId: trabajador.id,
      fecha_estimada_devolucion: '2026-12-05',
    });

    expect(res.status).toBe(409);
  });

  test('devuelve 404 si el registro no existe', async () => {
    const trabajador = await crearTrabajador();

    const res = await request(app).post('/api/asignaciones').send({
      registroId: 9999,
      trabajadorId: trabajador.id,
      fecha_estimada_devolucion: '2026-12-01',
    });

    expect(res.status).toBe(404);
  });

  test('devuelve 404 si el trabajador no existe', async () => {
    const registro = await crearRegistro();

    const res = await request(app).post('/api/asignaciones').send({
      registroId: registro.id,
      trabajadorId: 9999,
      fecha_estimada_devolucion: '2026-12-01',
    });

    expect(res.status).toBe(404);
  });

  test('devuelve 400 cuando falta la fecha estimada de devolución', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    const res = await request(app).post('/api/asignaciones').send({
      registroId: registro.id,
      trabajadorId: trabajador.id,
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/asignaciones/trabajador/:id', () => {
  test('lista las asignaciones de un trabajador, ordenadas y con el registro incluido', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    await request(app).post('/api/asignaciones').send({
      registroId: registro.id,
      trabajadorId: trabajador.id,
      fecha_estimada_devolucion: '2026-12-01',
    });

    const res = await request(app).get(`/api/asignaciones/trabajador/${trabajador.id}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].registro.codigo_unico).toBe(registro.codigo_unico);
  });

  test('devuelve 404 si el trabajador no existe', async () => {
    const res = await request(app).get('/api/asignaciones/trabajador/9999');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/asignaciones/:id/devolver', () => {
  test('marca la asignación como DEVUELTO y libera el registro', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    const creada = await request(app).post('/api/asignaciones').send({
      registroId: registro.id,
      trabajadorId: trabajador.id,
      fecha_estimada_devolucion: '2026-12-01',
    });

    const res = await request(app).patch(`/api/asignaciones/${creada.body.id}/devolver`);
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('DEVUELTO');
    expect(res.body.fecha_devolucion_real).not.toBeNull();

    const registroActualizado = await request(app).get(`/api/registros/${registro.codigo_unico}`);
    expect(registroActualizado.body.estado).toBe('DISPONIBLE');
  });

  test('devuelve 409 si la asignación ya fue devuelta', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    const creada = await request(app).post('/api/asignaciones').send({
      registroId: registro.id,
      trabajadorId: trabajador.id,
      fecha_estimada_devolucion: '2026-12-01',
    });

    await request(app).patch(`/api/asignaciones/${creada.body.id}/devolver`);
    const res = await request(app).patch(`/api/asignaciones/${creada.body.id}/devolver`);

    expect(res.status).toBe(409);
  });

  test('devuelve 404 si la asignación no existe', async () => {
    const res = await request(app).patch('/api/asignaciones/9999/devolver');
    expect(res.status).toBe(404);
  });
});
