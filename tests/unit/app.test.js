const request = require('supertest');

jest.mock('../../src/routes', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/error-de-prueba', (req, res, next) => {
    next(new Error('error de prueba'));
  });
  return router;
});

const crearApp = require('../../src/app');

describe('crearApp', () => {
  test('sirve el panel web en la ruta raíz', async () => {
    const response = await request(crearApp()).get('/');

    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
    expect(response.text).toContain('Bodega | Sistema de Gestión');
  });

  test('devuelve un error interno sin exponer detalles', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(crearApp()).get('/api/error-de-prueba');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error interno del servidor' });
    expect(consoleError).toHaveBeenCalledWith(expect.any(Error));

    consoleError.mockRestore();
  });
});

describe('iniciarServidor', () => {
  test('sincroniza la base de datos y empieza a escuchar en el puerto configurado', async () => {
    jest.resetModules();
    jest.doMock('../../src/config/database', () => ({
      sync: jest.fn().mockResolvedValue(undefined)
    }));
    process.env.PORT = '0';

    const appModule = require('../../src/app');
    const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const server = await appModule.iniciarServidor();

    expect(server.listening).toBe(true);
    expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining('Servidor escuchando'));

    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    consoleLog.mockRestore();
    delete process.env.PORT;
    jest.dontMock('../../src/config/database');
  });

  test('registra el error si falla la sincronización de la base de datos', async () => {
    jest.resetModules();
    jest.doMock('../../src/config/database', () => ({
      sync: jest.fn().mockRejectedValue(new Error('base de datos no disponible'))
    }));

    const appModule = require('../../src/app');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const processExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined);

    await appModule.iniciarServidor();

    expect(consoleError).toHaveBeenCalledWith(
      'Error al inicializar la base de datos:',
      expect.any(Error)
    );
    expect(processExit).toHaveBeenCalledWith(1);

    consoleError.mockRestore();
    processExit.mockRestore();
    jest.dontMock('../../src/config/database');
  });
});