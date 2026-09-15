/**
 * Genera un código único con formato REG-YYYYMMDD-XXXXX
 * tal como se especifica en la Sección 8.2.2 del informe (Módulo 1).
 */
function generarCodigoRegistro(fecha = new Date(), aleatorio = null) {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  const sufijo = aleatorio !== null
    ? String(aleatorio).padStart(5, '0')
    : String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `REG-${yyyy}${mm}${dd}-${sufijo}`;
}

/**
 * Genera un código único con formato ASIG-YYYYMMDD-XXXXX para asignaciones.
 */
function generarCodigoAsignacion(fecha = new Date(), aleatorio = null) {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  const sufijo = aleatorio !== null
    ? String(aleatorio).padStart(5, '0')
    : String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `ASIG-${yyyy}${mm}${dd}-${sufijo}`;
}

module.exports = { generarCodigoRegistro, generarCodigoAsignacion };
