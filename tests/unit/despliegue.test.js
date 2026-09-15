describe('configuración de despliegue', () => {
  const originalDbPath = process.env.DB_PATH;
  const originalPort = process.env.PORT;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    if (originalDbPath === undefined) delete process.env.DB_PATH;
    else process.env.DB_PATH = originalDbPath;

    if (originalPort === undefined) delete process.env.PORT;
    else process.env.PORT = originalPort;

    jest.resetModules();
  });

  test('usa la ruta de base de datos configurada por entorno', () => {
    process.env.DB_PATH = '/tmp/despliegue.sqlite';

    const sequelize = require('../../src/config/database');

    expect(sequelize.getDialect()).toBe('sqlite');
    expect(sequelize.options.storage).toBe('/tmp/despliegue.sqlite');
  });
});
