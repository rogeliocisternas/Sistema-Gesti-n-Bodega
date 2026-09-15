const request = require('supertest');
const crearApp = require('../../src/app');
const sequelize = require('../../src/config/database');

const app = crearApp();

let registroId;
let trabajadorId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const registro = await request(app)
    .post('/api/registros')
    .send({ tipo_registro: 'EQUIPO', descripcion: 'Notebook Dell', cantidad: 1 });
  registroId = registro.body.id;

  const trabajador = await request(app)
    .post('/api/trabajadores')
    .send({ rut: '11111111-1', nombre_completo: 'Ana Soto', email: 'ana@empresa.cl' });
  trabajadorId = trabajador.body.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/trabajadores', () => {
  test('rechaza RUT duplicado', async () => {
    const res = await request(app)
      .post('/api/trabajadores')
      .send({ rut: '11111111-1', nombre_completo: 'Otro Nombre', email: 'otro@empresa.cl' });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/asignaciones', () => {
  test('asigna un registro disponible a un trabajador (100% trazabilidad, OE-2)', async () => {
    const futuro = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const res = await request(app)
      .post('/api/asignaciones')
      .send({ registroId, trabajadorId, fecha_estimada_devolucion: futuro });

    expect(res.status).toBe(201);
    expect(res.body.codigo_asignacion).toMatch(/^ASIG-\d{8}-\d{5}$/);
  });

  test('rechaza asignar un registro ya asignado', async () => {
    const futuro = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const res = await request(app)
      .post('/api/asignaciones')
      .send({ registroId, trabajadorId, fecha_estimada_devolucion: futuro });

    expect(res.status).toBe(409);
  });

  test('rechaza asignación a trabajador inexistente', async () => {
    const registro2 = await request(app)
      .post('/api/registros')
      .send({ tipo_registro: 'EQUIPO', descripcion: 'Monitor', cantidad: 1 });
    const futuro = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post('/api/asignaciones')
      .send({ registroId: registro2.body.id, trabajadorId: 99999, fecha_estimada_devolucion: futuro });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/asignaciones/trabajador/:trabajadorId', () => {
  test('lista las asignaciones de un trabajador (vista personal)', async () => {
    const res = await request(app).get(`/api/asignaciones/trabajador/${trabajadorId}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('PATCH /api/asignaciones/:id/devolver', () => {
  test('devuelve una asignación y libera el registro', async () => {
    const lista = await request(app).get(`/api/asignaciones/trabajador/${trabajadorId}`);
    const asignacionId = lista.body[0].id;

    const res = await request(app).patch(`/api/asignaciones/${asignacionId}/devolver`);
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('DEVUELTA');

    const registro = await request(app).get(`/api/registros/${lista.body[0].codigo_unico || ''}`);
    // Verifica indirectamente vía listado que el registro volvió a DISPONIBLE
    const listado = await request(app).get('/api/registros?estado=DISPONIBLE');
    expect(listado.body.some(r => r.id === registroId)).toBe(true);
  });
});
