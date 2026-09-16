// Datos de ejemplo para pantallas que aún no tienen un endpoint real en el backend
// (Mermas, Reportes de mermas, Usuarios). Se usan solo para el prototipo de diseño.

export const mermasEjemplo = [
  {
    id: 1,
    codigo: 'MER-20260910-A1B2C',
    registroCodigo: 'REG-20260905-K3F9Q',
    descripcionRegistro: 'Cemento en sacos de 25kg',
    cantidad: 3,
    motivo: 'Sacos dañados por humedad en bodega',
    reportadoPor: 'Juan Pérez',
    fecha: '2026-09-10',
    estado: 'PENDIENTE',
    evidenciaUrl: null,
  },
  {
    id: 2,
    codigo: 'MER-20260908-Z8X1M',
    registroCodigo: 'REG-20260901-P2L4R',
    descripcionRegistro: 'Notebook Dell Latitude',
    cantidad: 1,
    motivo: 'Pantalla trizada durante traslado',
    reportadoPor: 'Ana Soto',
    fecha: '2026-09-08',
    estado: 'APROBADA',
    evidenciaUrl: null,
  },
  {
    id: 3,
    codigo: 'MER-20260830-Q4T7N',
    registroCodigo: 'REG-20260828-D9W2E',
    descripcionRegistro: 'Taladro percutor Bosch',
    cantidad: 1,
    motivo: 'Reportado por error, equipo en buen estado',
    reportadoPor: 'Pedro Pérez',
    fecha: '2026-08-30',
    estado: 'RECHAZADA',
    evidenciaUrl: null,
  },
];

export const usuariosEjemplo = [
  { id: 1, nombre: 'Rogelio Cisternas', email: 'rogelio.cisternas@example.com', rol: 'ADMIN', activo: true },
  { id: 2, nombre: 'Ana Soto', email: 'ana.soto@example.com', rol: 'OPERADOR', activo: true },
  { id: 3, nombre: 'Pedro Pérez', email: 'pedro.perez@example.com', rol: 'OPERADOR', activo: false },
];

// Indicadores proyectados según el diagnóstico y los objetivos del informe (Secciones 2 y 7.1):
// tiempo por registro, tasa de errores y costo anual sirven de referencia comparativa en el
// Dashboard mientras no exista medición real con usuarios en producción.
export const indicadoresInforme = {
  tiempoPorRegistroActual: 5,
  tiempoPorRegistroSistema: 2,
  tasaErroresActual: 5,
  tasaErroresSistema: 1,
  costoAnualActual: 17700,
  costoAnualSistema: 6326,
};

export const mermasPorTipoEjemplo = [
  { etiqueta: 'MATERIAL', valor: 5 },
  { etiqueta: 'EQUIPO', valor: 2 },
  { etiqueta: 'DOCUMENTO', valor: 0 },
  { etiqueta: 'OTRO', valor: 1 },
];
