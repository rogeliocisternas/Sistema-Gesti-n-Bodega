// Datos de ejemplo para pantallas que aún no tienen un endpoint real en el backend (Usuarios).
// Mermas, Registros, Asignaciones y sus indicadores derivados ya usan datos reales de la API.

export const usuariosEjemplo = [
  { id: 1, nombre: 'Rogelio Cisternas', email: 'rogelio.cisternas@example.com', rol: 'ADMIN', activo: true },
  { id: 2, nombre: 'Ana Soto', email: 'ana.soto@example.com', rol: 'OPERADOR', activo: true },
  { id: 3, nombre: 'Pedro Pérez', email: 'pedro.perez@example.com', rol: 'OPERADOR', activo: false },
];

// "Tiempo por registro" es la única meta que sigue siendo una proyección de diseño (RF-01/OE-1):
// no se puede medir desde los datos sembrados porque requeriría cronometrar interacciones reales
// de usuarios. Tasa de error y costo operativo ya se calculan desde la base (ver utils/indicadores.js).
export const indicadoresInforme = {
  tiempoPorRegistroActual: 5,
  tiempoPorRegistroSistema: 2,
};
