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

## Puesta en marcha con contenedores (recomendado)

Con Docker:

```bash
docker compose up --build
```

Con Podman (usa el mismo `docker-compose.yml`, sin cambios):

```bash
podman machine start   # si la máquina no está corriendo
podman compose up --build
```

- Backend: http://localhost:3000/api/health
- Frontend: http://localhost:5173

Para bajar los contenedores: `docker compose down` / `podman compose down` (agregar `-v` además
elimina el volumen `bodega_pgdata` con los datos de Postgres).

**Nota (Podman + Docker Desktop instalado a la vez):** si `podman compose up` falla con
`error getting credentials - err: exec: "docker-credential-desktop": executable file not found`,
es porque `podman compose` usa el `docker-compose` clásico como backend y este lee
`~/.docker/config.json` (de Docker Desktop), que referencia un credential helper que Podman no
tiene. Sin tocar esa config global, se puede aislar con una config vacía solo para el comando:

```bash
mkdir -p /tmp/podman-docker-config
echo '{"auths": {}}' > /tmp/podman-docker-config/config.json
DOCKER_CONFIG=/tmp/podman-docker-config podman compose up --build
```

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
