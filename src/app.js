const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');

function crearApp() {
  const app = express();

  // Seguridad aplicada (Anexo: Documentación de Seguridad)
  app.use(helmet()); // cabeceras HTTP seguras (mitiga XSS, sniffing, clickjacking)
  app.use(express.json({ limit: '1mb' })); // evita payloads excesivos

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(limiter); // mitigación básica de fuerza bruta / abuso (RF-06, portal público)

  app.use('/api', routes);

  app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

  // Manejador de errores centralizado: evita fugas de stack trace al cliente
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  return app;
}

module.exports = crearApp;

if (require.main === module) {
  const sequelize = require('./config/database');
  const app = crearApp();
  sequelize.sync().then(() => {
    app.listen(3000, () => console.log('Servidor escuchando en puerto 3000'));
  });
}
