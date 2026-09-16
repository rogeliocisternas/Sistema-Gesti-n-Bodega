# Sistema de Gestión de Bodega (MVP)

MVP funcional del Sistema de Gestión de Bodega descrito en el Trabajo de Aplicación Práctica
(Instituto Profesional AIEP). Cubre los dos módulos priorizados del informe — **Registros de
Entrada** y **Asignaciones a Trabajadores** — con backend, frontend y base de datos operativos.

Hay **dos implementaciones de backend** con el mismo contrato de API (mismos endpoints y formas
de respuesta), para dos entornos distintos:

| | `backend/` | `worker/` |
|---|---|---|
| Runtime | Node.js + Express + Sequelize | Cloudflare Workers + Hono |
| Base de datos | PostgreSQL 15 (SQLite en memoria para tests) | Cloudflare D1 (SQLite serverless) |
| Uso | Docker/Podman, cualquier host Node, desarrollo local | Deploy serverless en Cloudflare (mismo dominio que el frontend) |

El frontend (`frontend/`) es el mismo para ambos: por defecto llama a `/api` (mismo origen), así
que funciona sin cambios contra cualquiera de los dos backends.

## Stack

- **Backend (Node)**: Express + Sequelize, validación con Joi, seguridad con Helmet y
  express-rate-limit.
- **Backend (Cloudflare)**: Hono + D1, mismas reglas de validación reescritas sin dependencias de
  Node (Workers no ejecuta un runtime Node.js).
- **Frontend**: React 18 (Vite) + Material-UI.
- **Base de datos**: PostgreSQL 15 (backend Node) o D1 (backend Cloudflare).

## Estructura

```
backend/    API REST sobre Express + Sequelize/Postgres + tests Jest/Supertest
worker/     La misma API sobre Hono + D1, lista para Cloudflare Workers + tests vitest-pool-workers
frontend/   SPA React + MUI que consume la API (funciona contra cualquiera de los dos backends)
docker-compose.yml   Levanta Postgres + backend + frontend juntos (para el backend Node)
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

## Despliegue en Cloudflare (Workers + D1)

Un solo Worker sirve **frontend (assets estáticos) + backend (API `/api/*`) + base de datos (D1)**
bajo el mismo dominio, sin necesidad de configurar CORS ni una URL de API separada.

### Ya hecho (no repetir)

- Se creó la base D1 `sistema-gestion-bodega-db` (`f27cc119-34b4-47b0-adb0-4dbe483d8c5d`) en tu
  cuenta de Cloudflare y se le aplicó el esquema (`worker/schema.sql`): tablas `trabajadores`,
  `registros_entrada`, `asignaciones`. **No vuelvas a correr `npm run db:migrate:remote`** salvo
  que quieras borrar y recrear todo desde cero (ese script hace `DROP TABLE` primero).
- `worker/wrangler.toml` ya apunta al Worker existente `sistema-gestion-bodega` (el mismo nombre
  que ya tenías en tu cuenta) y a esa base D1.

### Pasos para publicar (requiere tu login de Cloudflare, no lo tengo yo)

```bash
cd frontend
npm install
npm run build          # genera frontend/dist, que el Worker sirve como assets estáticos

cd ../worker
npm install
npx wrangler login      # abre el navegador para autenticarte (una sola vez)
npx wrangler deploy     # publica frontend/dist + la API + el binding a D1, todo en un solo Worker
```

Después de `wrangler deploy`, la URL que ya tenías
(`https://sistema-gestion-bodega.<tu-subdominio>.workers.dev`) debería mostrar la app funcionando
y `/api/health` debería responder `{"status":"ok"}`.

### Por qué estaba roto

El Worker ya publicado estaba sirviendo el `index.html` **fuente** del frontend (sin compilar con
Vite), por eso la página quedaba en blanco — el navegador no puede ejecutar el `src="/src/main.jsx"`
directamente. Además no existía ningún backend desplegado: el backend original (Node/Express/
Sequelize/Postgres) no es compatible con el runtime de Cloudflare Workers (no ejecuta servidores
Node con `app.listen()`, no tiene el driver nativo de Postgres, y no existía ninguna base D1). Por
eso se reescribió el backend con Hono (framework nativo de Workers) y D1 en `worker/`.

### Desarrollo y tests locales del backend Cloudflare

```bash
cd worker
npm install
npm run db:migrate:local   # aplica el esquema a la D1 simulada localmente
npm run dev                 # wrangler dev — sirve frontend/dist + API en http://localhost:8787
npm test                    # 51 tests (unit + integración) con vitest-pool-workers
```

## Alcance del MVP

Según la delimitación del informe (Sección 4.3 y 5.2), este MVP implementa y prueba **OE-1
(Registros de Entrada)** y **OE-2 (Asignaciones a Trabajadores)**. Los módulos de Portal Web
público (OE-3), Reportes (OE-4) y Mermas (OE-5) quedan a nivel de diseño en el informe y no
forman parte de este código.
