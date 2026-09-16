function generarSufijo(longitud = 5) {
  const caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let sufijo = '';
  for (let i = 0; i < longitud; i += 1) {
    sufijo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return sufijo;
}

function generarFechaCompacta(fecha = new Date()) {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function generarCodigoRegistro(fecha = new Date()) {
  return `REG-${generarFechaCompacta(fecha)}-${generarSufijo()}`;
}

function generarCodigoAsignacion(fecha = new Date()) {
  return `ASIG-${generarFechaCompacta(fecha)}-${generarSufijo()}`;
}

module.exports = { generarCodigoRegistro, generarCodigoAsignacion, generarSufijo, generarFechaCompacta };
