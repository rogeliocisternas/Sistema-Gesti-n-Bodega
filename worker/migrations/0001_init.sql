CREATE TABLE trabajadores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rut TEXT NOT NULL UNIQUE,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  cargo TEXT,
  departamento TEXT,
  email TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE registros_entrada (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_unico TEXT NOT NULL UNIQUE,
  tipo_registro TEXT NOT NULL CHECK (tipo_registro IN ('MATERIAL','EQUIPO','DOCUMENTO','OTRO')),
  descripcion TEXT NOT NULL,
  cantidad REAL NOT NULL CHECK (cantidad > 0),
  unidad_medida TEXT NOT NULL DEFAULT 'UNIDAD',
  estado TEXT NOT NULL DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE','ASIGNADO','EN_MANTENIMIENTO','BAJA')),
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE asignaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_unico TEXT NOT NULL UNIQUE,
  registroId INTEGER NOT NULL REFERENCES registros_entrada(id),
  trabajadorId INTEGER NOT NULL REFERENCES trabajadores(id),
  fecha_asignacion TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  fecha_estimada_devolucion TEXT NOT NULL,
  fecha_devolucion_real TEXT,
  estado TEXT NOT NULL DEFAULT 'ASIGNADO' CHECK (estado IN ('ASIGNADO','DEVUELTO')),
  observaciones TEXT,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_asignaciones_trabajador ON asignaciones(trabajadorId);
CREATE INDEX idx_asignaciones_registro ON asignaciones(registroId);
