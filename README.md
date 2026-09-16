# Sistema de Gestión de Bodega (MVP)

MVP funcional del Sistema de Gestión de Bodega descrito en el Trabajo de Aplicación Práctica
(Instituto Profesional AIEP). Cubre los dos módulos priorizados del informe — **Registros de
Entrada** y **Asignaciones a Trabajadores** — con backend, frontend y base de datos operativos.

## Stack

- **Backend**: Node.js + Express + Sequelize, validación con Joi, seguridad con Helmet y
  express-rate-limit.
- **Frontend**: React 18 (Vite) + Material-UI.
- **Base de datos**: PostgreSQL 15 (desarrollo/producción) — SQLite en memoria para los tests.

## Estructura

```
backend/    API REST (registros, trabajadores, asignaciones) + tests Jest/Supertest
frontend/   SPA React + MUI que consume la API
docker-compose.yml   Levanta Postgres + backend + frontend juntos
```

## Puesta en marcha con Docker (recomendado)

```bash
docker compose up --build
```

- Backend: http://localhost:3000/api/health
- Frontend: http://localhost:5173

## Puesta en marcha manual

### Base de datos

Crear una base Postgres local (o usar `docker compose up db`) y copiar `backend/.env.example` a
`backend/.env` con las credenciales correspondientes.

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Tests y cobertura del backend

```bash
cd backend
npm run test:coverage
```

Suite de 44 pruebas (unitarias + integración) con Jest + Supertest, cobertura >90% de líneas
(umbral mínimo configurado: 85%, alineado con el objetivo OE-7 del informe).

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/registros | Crear registro de entrada (código único automático) |
| GET | /api/registros | Listar registros (filtros: `tipo_registro`, `estado`) |
| GET | /api/registros/:codigo | Obtener registro por código único |
| PUT | /api/registros/:codigo | Actualizar registro |
| POST | /api/trabajadores | Registrar trabajador |
| GET | /api/trabajadores | Listar trabajadores |
| GET | /api/trabajadores/:rut | Obtener trabajador por RUT |
| POST | /api/asignaciones | Asignar un registro disponible a un trabajador |
| GET | /api/asignaciones/trabajador/:id | Listar asignaciones de un trabajador |
| PATCH | /api/asignaciones/:id/devolver | Registrar devolución y liberar el registro |

## Alcance del MVP

Según la delimitación del informe (Sección 4.3 y 5.2), este MVP implementa y prueba **OE-1
(Registros de Entrada)** y **OE-2 (Asignaciones a Trabajadores)**. Los módulos de Portal Web
público (OE-3), Reportes (OE-4) y Mermas (OE-5) quedan a nivel de diseño en el informe y no
forman parte de este código.
