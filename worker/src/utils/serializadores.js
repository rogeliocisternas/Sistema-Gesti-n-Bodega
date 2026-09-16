// D1/SQLite no tiene tipo booleano nativo: "activo" viaja como 0/1 y se normaliza a boolean
// para que el frontend (que espera trabajador.activo === true/false) funcione sin cambios.
export function serializarTrabajador(row) {
  if (!row) return row;
  return { ...row, activo: !!row.activo };
}

export function serializarRegistro(row) {
  return row;
}

export function serializarAsignacion(row) {
  return row;
}
