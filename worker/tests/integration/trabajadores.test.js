import { env } from 'cloudflare:test';
import { describe, expect, test } from 'vitest';
import app from '../../src/index';

function post(body) {
  return app.request(
    '/api/trabajadores',
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    env
  );
}

describe('POST /api/trabajadores', () => {
  test('crea un trabajador válido', async () => {
    const res = await post({ rut: '15899839-4', nombres: 'Rogelio', apellidos: 'Cisternas', cargo: 'Bodeguero', email: 'rogelio@example.com' });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.rut).toBe('15899839-4');
    expect(body.activo).toBe(true);
  });

  test('devuelve 400 con un RUT de formato inválido', async () => {
    const res = await post({ rut: '158998394', nombres: 'Rogelio', apellidos: 'Cisternas' });
    expect(res.status).toBe(400);
  });

  test('crea un trabajador sin email, cargo ni departamento (campos opcionales vacíos)', async () => {
    const res = await post({ rut: '33333333-3', nombres: 'Ana', apellidos: 'Soto', cargo: '', departamento: '', email: '' });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.email).toBeNull();
  });

  test('devuelve 409 cuando el RUT ya está registrado', async () => {
    await post({ rut: '15899839-4', nombres: 'Rogelio', apellidos: 'Cisternas' });
    const res = await post({ rut: '15899839-4', nombres: 'Otro', apellidos: 'Trabajador' });
    expect(res.status).toBe(409);
  });
});

describe('GET /api/trabajadores', () => {
  test('lista los trabajadores registrados', async () => {
    await post({ rut: '11111111-1', nombres: 'Ana', apellidos: 'Soto' });
    const res = await app.request('/api/trabajadores', {}, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/trabajadores/:rut', () => {
  test('obtiene un trabajador por RUT', async () => {
    await post({ rut: '22222222-2', nombres: 'Pedro', apellidos: 'Perez' });
    const res = await app.request('/api/trabajadores/22222222-2', {}, env);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.nombres).toBe('Pedro');
  });

  test('devuelve 404 si el RUT no existe', async () => {
    const res = await app.request('/api/trabajadores/99999999-9', {}, env);
    expect(res.status).toBe(404);
  });
});
