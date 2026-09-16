CREATE TABLE mermas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo_unico TEXT NOT NULL UNIQUE,
  registroId INTEGER NOT NULL REFERENCES registros_entrada(id),
  cantidad REAL NOT NULL CHECK (cantidad > 0),
  motivo TEXT NOT NULL,
  reportado_por TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE','APROBADA','RECHAZADA')),
  evidencia_url TEXT,
  createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_mermas_registro ON mermas(registroId);
