import { env } from 'cloudflare:test';
import { describe, expect, test } from 'vitest';
import app from '../../src/index';

async function crearRegistro(overrides = {}) {
  return app.request(
    '/api/registros',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo_registro: 'EQUIPO',
        descripcion: 'Notebook Dell',
        cantidad: 1,
        ...overrides,
      }),
    },
    env
  );
}

describe('POST /api/registros', () => {
  test('crea un registro con código único y estado DISPONIBLE', async () => {
    const res = await crearRegistro({ tipo_registro: 'MATERIAL', descripcion: 'Cemento en sacos', cantidad: 20 });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.codigo_unico).toMatch(/^REG-\d{8}-[0-9A-Z]{5}$/);
    expect(body.estado).toBe('DISPONIBLE');
  });

  test('devuelve 400 cuando faltan campos requeridos', async () => {
    const res = await app.request(
      '/api/registros',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo_registro: 'MATERIAL' }) },
      env
    );
    expect(res.status).toBe(400);
  });

  test('devuelve 400 cuando el tipo_registro no es válido', async () => {
    const res = await app.request(
      '/api/registros',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo_registro: 'NO_EXISTE', descripcion: 'Algo', cantidad: 1 }),
      },
      env
    );
    expect(res.status).toBe(400);
  });
});

describe('GET /api/registros', () => {
  test('lista los registros creados', async () => {
    await crearRegistro();
    const res = await app.request('/api/registros', {}, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  test('filtra por tipo_registro', async () => {
    await crearRegistro({ tipo_registro: 'DOCUMENTO', descripcion: 'Contrato de arriendo' });
    await crearRegistro({ tipo_registro: 'MATERIAL', descripcion: 'Fierro' });

    const res = await app.request('/api/registros?tipo_registro=DOCUMENTO', {}, env);
    const body = await res.json();
    expect(body.every((r) => r.tipo_registro === 'DOCUMENTO')).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/registros/:codigo', () => {
  test('obtiene un registro existente por código', async () => {
    const creado = await (await crearRegistro({ descripcion: 'Caja de herramientas' })).json();
    const res = await app.request(`/api/registros/${creado.codigo_unico}`, {}, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.codigo_unico).toBe(creado.codigo_unico);
  });

  test('devuelve 404 si el código no existe', async () => {
    const res = await app.request('/api/registros/REG-00000000-XXXXX', {}, env);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/registros/:codigo', () => {
  test('actualiza un registro existente', async () => {
    const creado = await (await crearRegistro({ descripcion: 'Pintura' })).json();
    const res = await app.request(
      `/api/registros/${creado.codigo_unico}`,
      { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: 'EN_MANTENIMIENTO' }) },
      env
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.estado).toBe('EN_MANTENIMIENTO');
  });

  test('devuelve 404 al actualizar un código inexistente', async () => {
    const res = await app.request(
      '/api/registros/REG-00000000-XXXXX',
      { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: 'BAJA' }) },
      env
    );
    expect(res.status).toBe(404);
  });

  test('devuelve 400 cuando el cuerpo de actualización está vacío', async () => {
    const creado = await (await crearRegistro({ descripcion: 'Pintura' })).json();
    const res = await app.request(
      `/api/registros/${creado.codigo_unico}`,
      { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) },
      env
    );
    expect(res.status).toBe(400);
  });
});
