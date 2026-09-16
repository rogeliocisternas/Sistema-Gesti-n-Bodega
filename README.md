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

El backend Cloudflare (`worker/`) tiene su propia suite (62 pruebas con vitest-pool-workers, ver
más abajo) e incluye además el módulo de **Mermas**, que `backend/` (Node) todavía no tiene — ver
"Alcance del MVP".

## Endpoints principales

| Método | Ruta | Descripción | Disponible en |
|---|---|---|---|
| POST | /api/registros | Crear registro de entrada (código único automático) | ambos |
| GET | /api/registros | Listar registros (filtros: `tipo_registro`, `estado`) | ambos |
| GET | /api/registros/:codigo | Obtener registro por código único | ambos |
| PUT | /api/registros/:codigo | Actualizar registro | ambos |
| POST | /api/trabajadores | Registrar trabajador | ambos |
| GET | /api/trabajadores | Listar trabajadores | ambos |
| GET | /api/trabajadores/:rut | Obtener trabajador por RUT | ambos |
| POST | /api/asignaciones | Asignar un registro disponible a un trabajador | ambos |
| GET | /api/asignaciones | Listar todas las asignaciones (filtro: `estado`) | solo `worker/` |
| GET | /api/asignaciones/trabajador/:id | Listar asignaciones de un trabajador | ambos |
| PATCH | /api/asignaciones/:id/devolver | Registrar devolución y liberar el registro | ambos |
| POST | /api/mermas | Reportar una merma sobre un registro | solo `worker/` |
| GET | /api/mermas | Listar mermas (filtro: `estado`), con el registro incluido | solo `worker/` |
| PATCH | /api/mermas/:id/aprobar | Aprobar una merma pendiente | solo `worker/` |
| PATCH | /api/mermas/:id/rechazar | Rechazar una merma pendiente | solo `worker/` |

## Despliegue en Cloudflare (Workers + D1)

Un solo Worker sirve **frontend (assets estáticos) + backend (API `/api/*`) + base de datos (D1)**
bajo el mismo dominio, sin necesidad de configurar CORS ni una URL de API separada. El binding a
D1 (nombre de la base, su ID) vive en `worker/wrangler.toml` — **es código, no configuración del
dashboard**: cada `wrangler deploy` (manual o automático) lo vuelve a aplicar tal cual está en ese
archivo, así que nunca se puede "desconectar" salvo que se edite el archivo.

### Deploy automático (CI/CD)

`.github/workflows/deploy-cloudflare.yml` compila el frontend y corre `wrangler deploy` en cada
push a `develop` que toque `worker/`, `frontend/` o el propio workflow (también se puede lanzar a
mano desde la pestaña Actions de GitHub, botón "Run workflow"). Esto reemplaza el deploy manual y
evita el problema que ya tuvimos una vez: un deploy viejo/roto pisando el bueno por accidente.

**Paso único que debes hacer tú** (no puedo crear secretos de GitHub por ti): en el repo, ve a
Settings → Secrets and variables → Actions → New repository secret, y crea uno llamado
`CLOUDFLARE_API_TOKEN` con un token de Cloudflare que tenga permisos de **Workers Scripts (Edit)**
y **D1 (Edit)** — se crea en el dashboard de Cloudflare en Mi Perfil → API Tokens → Create Token
(plantilla "Edit Cloudflare Workers" cubre lo necesario). Sin ese secreto, el workflow va a fallar
en el paso de deploy con un error de autenticación.

### Ya hecho (no repetir)

- Se creó la base D1 `sistema-gestion-bodega-db` (`f27cc119-34b4-47b0-adb0-4dbe483d8c5d`) en tu
  cuenta de Cloudflare y se le aplicó el esquema (`worker/schema.sql`): tablas `trabajadores`,
  `registros_entrada`, `asignaciones`, `mermas`. **No vuelvas a correr `npm run db:migrate:remote`**
  salvo que quieras borrar y recrear todo desde cero (ese script hace `DROP TABLE` primero).
- `worker/wrangler.toml` ya apunta al Worker existente `sistema-gestion-bodega` (el mismo nombre
  que ya tenías en tu cuenta) y a esa base D1.
- Ya está desplegado y funcionando: `wrangler login` quedó autenticado en esta máquina y se corrió
  `wrangler deploy`. La base remota tiene datos de demostración cargados (ver más abajo).

### Datos de demostración ya cargados en producción

La base D1 remota tiene: 10 trabajadores, 170 registros (100 en estado `ASIGNADO`, 70
`DISPONIBLE`) y 20 mermas en estado `PENDIENTE`. Se generaron con
`worker/scripts/generar-seed.mjs` (genera SQL determinista con datos ficticios pero realistas) y
se aplicaron con:

```bash
cd worker
node scripts/generar-seed.mjs > scripts/seed-datos.sql
npx wrangler d1 execute sistema-gestion-bodega-db --remote --file=./scripts/seed-datos.sql
```

`scripts/seed-datos.sql` queda versionado como registro de lo que se cargó. Para regenerar con
datos nuevos, hay que volver a correr `generar-seed.mjs` (sobrescribe el .sql) — el script es
aditivo (no borra nada), así que correrlo de nuevo suma otro lote de registros en vez de
reemplazar el anterior.

**Tasa de errores** y **costo operativo estimado** en el Dashboard se calculan en el frontend a
partir de estos totales reales (ver `frontend/src/utils/indicadores.js`), usando las mismas
tarifas del análisis económico del informe ($15 USD/hora, $3 USD por merma) — no son la
proyección de planificación de la Sección 6.2, sino un cálculo directo sobre el volumen de datos
actualmente en la base.

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
npm test                    # 62 tests (unit + integración) con vitest-pool-workers
```

## Alcance del MVP

El informe (Sección 4.3 y 5.2) documenta OE-1 (Registros) y OE-2 (Asignaciones) como los únicos
módulos construidos y probados, dejando OE-3 (Portal Web), OE-4 (Reportes) y OE-5 (Mermas) a nivel
de diseño. El backend Cloudflare (`worker/`) fue más allá de ese alcance original:

- **OE-1 y OE-2** (Registros, Asignaciones): implementados y probados en `backend/` (Node) y en
  `worker/` (Cloudflare), con datos reales.
- **OE-3** (Portal Web de consultas): implementado en el frontend (`PortalPublicoPage.jsx`) contra
  los endpoints GET públicos, que ya existían en ambos backends.
- **OE-4** (Reportes): implementado en el frontend (`ReportesPage.jsx`) como agregaciones sobre
  los datos reales de registros/asignaciones/mermas, sin necesitar un endpoint de reportes aparte.
- **OE-5** (Mermas): implementado de punta a punta — modelo de datos, endpoints
  (`POST/GET /api/mermas`, aprobar/rechazar) y frontend — pero **solo en `worker/`**, no en
  `backend/` (Node), que todavía no tiene esa tabla ni esas rutas.

En resumen: `worker/` (el que está desplegado en Cloudflare) cubre los 5 objetivos específicos con
datos reales; `backend/` (Node/Postgres, para uso local/Docker) sigue limitado a OE-1 y OE-2, tal
como lo describe el informe original.
