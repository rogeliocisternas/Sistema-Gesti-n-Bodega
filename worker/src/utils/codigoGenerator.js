export function generarSufijo(longitud = 5) {
  const caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let sufijo = '';
  for (let i = 0; i < longitud; i += 1) {
    sufijo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return sufijo;
}

export function generarFechaCompacta(fecha = new Date()) {
  const yyyy = fecha.getUTCFullYear();
  const mm = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

export function generarCodigoRegistro(fecha = new Date()) {
  return `REG-${generarFechaCompacta(fecha)}-${generarSufijo()}`;
}

export function generarCodigoAsignacion(fecha = new Date()) {
  return `ASIG-${generarFechaCompacta(fecha)}-${generarSufijo()}`;
}

export function generarCodigoMerma(fecha = new Date()) {
  return `MER-${generarFechaCompacta(fecha)}-${generarSufijo()}`;
}
