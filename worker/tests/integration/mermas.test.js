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
    body: JSON.stringify({ tipo_registro: 'MATERIAL', descripcion: 'Cemento en sacos', cantidad: 10, ...overrides }),
  });
  return res.json();
}

function crearMerma(body) {
  return req('/api/mermas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/mermas', () => {
  test('reporta una merma para un registro existente', async () => {
    const registro = await crearRegistro();
    const res = await crearMerma({ registroId: registro.id, cantidad: 2, motivo: 'Sacos dañados', reportado_por: 'Ana Soto' });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.codigo_unico).toMatch(/^MER-\d{8}-[0-9A-Z]{5}$/);
    expect(body.estado).toBe('PENDIENTE');
  });

  test('devuelve 404 si el registro no existe', async () => {
    const res = await crearMerma({ registroId: 9999, cantidad: 1, motivo: 'Motivo', reportado_por: 'Ana' });
    expect(res.status).toBe(404);
  });

  test('devuelve 400 cuando falta el motivo', async () => {
    const registro = await crearRegistro();
    const res = await crearMerma({ registroId: registro.id, cantidad: 1, reportado_por: 'Ana' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/mermas', () => {
  test('lista las mermas con el registro incluido', async () => {
    const registro = await crearRegistro({ descripcion: 'Notebook Dell' });
    await crearMerma({ registroId: registro.id, cantidad: 1, motivo: 'Pantalla trizada', reportado_por: 'Ana Soto' });

    const res = await req('/api/mermas');
    const body = await res.json();
    expect(body.length).toBe(1);
    expect(body[0].registro.descripcion).toBe('Notebook Dell');
  });

  test('filtra por estado', async () => {
    const registro = await crearRegistro();
    await crearMerma({ registroId: registro.id, cantidad: 1, motivo: 'Motivo', reportado_por: 'Ana' });

    const res = await req('/api/mermas?estado=APROBADA');
    const body = await res.json();
    expect(body.length).toBe(0);
  });
});

describe('PATCH /api/mermas/:id/aprobar y /rechazar', () => {
  test('aprueba una merma pendiente', async () => {
    const registro = await crearRegistro();
    const creada = await (await crearMerma({ registroId: registro.id, cantidad: 1, motivo: 'Motivo', reportado_por: 'Ana' })).json();

    const res = await req(`/api/mermas/${creada.id}/aprobar`, { method: 'PATCH' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.estado).toBe('APROBADA');
  });

  test('rechaza una merma pendiente', async () => {
    const registro = await crearRegistro();
    const creada = await (await crearMerma({ registroId: registro.id, cantidad: 1, motivo: 'Motivo', reportado_por: 'Ana' })).json();

    const res = await req(`/api/mermas/${creada.id}/rechazar`, { method: 'PATCH' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.estado).toBe('RECHAZADA');
  });

  test('devuelve 409 si la merma ya fue revisada', async () => {
    const registro = await crearRegistro();
    const creada = await (await crearMerma({ registroId: registro.id, cantidad: 1, motivo: 'Motivo', reportado_por: 'Ana' })).json();

    await req(`/api/mermas/${creada.id}/aprobar`, { method: 'PATCH' });
    const res = await req(`/api/mermas/${creada.id}/rechazar`, { method: 'PATCH' });
    expect(res.status).toBe(409);
  });

  test('devuelve 404 si la merma no existe', async () => {
    const res = await req('/api/mermas/9999/aprobar', { method: 'PATCH' });
    expect(res.status).toBe(404);
  });
});
