import { env } from 'cloudflare:test';
import { describe, expect, test } from 'vitest';
import app from '../../src/index';

function req(path, init) {
  return app.request(path, init, env);
}

async function crearRegistro(overrides = {}) {
  const res = await req('/api/registros', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo_registro: 'EQUIPO', descripcion: 'Notebook Dell', cantidad: 1, ...overrides }),
  });
  return res.json();
}

async function crearTrabajador(overrides = {}) {
  const res = await req('/api/trabajadores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rut: '15899839-4', nombres: 'Rogelio', apellidos: 'Cisternas', ...overrides }),
  });
  return res.json();
}

function crearAsignacion(body) {
  return req('/api/asignaciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/asignaciones', () => {
  test('asigna un registro disponible a un trabajador y cambia su estado a ASIGNADO', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    const res = await crearAsignacion({
      registroId: registro.id,
      trabajadorId: trabajador.id,
      fecha_estimada_devolucion: '2026-12-01',
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.codigo_unico).toMatch(/^ASIG-\d{8}-[0-9A-Z]{5}$/);
    expect(body.estado).toBe('ASIGNADO');

    const registroActualizado = await (await req(`/api/registros/${registro.codigo_unico}`)).json();
    expect(registroActualizado.estado).toBe('ASIGNADO');
  });

  test('conserva exactamente la fecha estimada de devolución (sin corrimiento de huso horario)', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    const res = await crearAsignacion({
      registroId: registro.id,
      trabajadorId: trabajador.id,
      fecha_estimada_devolucion: '2026-01-12',
    });

    const body = await res.json();
    expect(body.fecha_estimada_devolucion).toBe('2026-01-12');
  });

  test('devuelve 409 si el registro ya está asignado', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    await crearAsignacion({ registroId: registro.id, trabajadorId: trabajador.id, fecha_estimada_devolucion: '2026-12-01' });
    const res = await crearAsignacion({ registroId: registro.id, trabajadorId: trabajador.id, fecha_estimada_devolucion: '2026-12-05' });

    expect(res.status).toBe(409);
  });

  test('devuelve 404 si el registro no existe', async () => {
    const trabajador = await crearTrabajador();
    const res = await crearAsignacion({ registroId: 9999, trabajadorId: trabajador.id, fecha_estimada_devolucion: '2026-12-01' });
    expect(res.status).toBe(404);
  });

  test('devuelve 404 si el trabajador no existe', async () => {
    const registro = await crearRegistro();
    const res = await crearAsignacion({ registroId: registro.id, trabajadorId: 9999, fecha_estimada_devolucion: '2026-12-01' });
    expect(res.status).toBe(404);
  });

  test('devuelve 400 cuando falta la fecha estimada de devolución', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();
    const res = await crearAsignacion({ registroId: registro.id, trabajadorId: trabajador.id });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/asignaciones/trabajador/:id', () => {
  test('lista las asignaciones de un trabajador, con el registro incluido', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    await crearAsignacion({ registroId: registro.id, trabajadorId: trabajador.id, fecha_estimada_devolucion: '2026-12-01' });

    const res = await req(`/api/asignaciones/trabajador/${trabajador.id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBe(1);
    expect(body[0].registro.codigo_unico).toBe(registro.codigo_unico);
  });

  test('devuelve 404 si el trabajador no existe', async () => {
    const res = await req('/api/asignaciones/trabajador/9999');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/asignaciones/:id/devolver', () => {
  test('marca la asignación como DEVUELTO y libera el registro', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    const creada = await (
      await crearAsignacion({ registroId: registro.id, trabajadorId: trabajador.id, fecha_estimada_devolucion: '2026-12-01' })
    ).json();

    const res = await req(`/api/asignaciones/${creada.id}/devolver`, { method: 'PATCH' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.estado).toBe('DEVUELTO');
    expect(body.fecha_devolucion_real).not.toBeNull();

    const registroActualizado = await (await req(`/api/registros/${registro.codigo_unico}`)).json();
    expect(registroActualizado.estado).toBe('DISPONIBLE');
  });

  test('devuelve 409 si la asignación ya fue devuelta', async () => {
    const registro = await crearRegistro();
    const trabajador = await crearTrabajador();

    const creada = await (
      await crearAsignacion({ registroId: registro.id, trabajadorId: trabajador.id, fecha_estimada_devolucion: '2026-12-01' })
    ).json();

    await req(`/api/asignaciones/${creada.id}/devolver`, { method: 'PATCH' });
    const res = await req(`/api/asignaciones/${creada.id}/devolver`, { method: 'PATCH' });

    expect(res.status).toBe(409);
  });

  test('devuelve 404 si la asignación no existe', async () => {
    const res = await req('/api/asignaciones/9999/devolver', { method: 'PATCH' });
    expect(res.status).toBe(404);
  });
});
