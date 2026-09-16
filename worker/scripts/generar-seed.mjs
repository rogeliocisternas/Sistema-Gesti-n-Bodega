// Genera worker/scripts/seed-datos.sql con datos de demostración:
// 10 trabajadores, 168 registros nuevos (+2 ya existentes = 170 "registros totales"),
// 100 asignaciones (100 "activos asignados") y 20 mermas pendientes.
//
// Uso: node scripts/generar-seed.mjs > scripts/seed-datos.sql
// Luego: npx wrangler d1 execute sistema-gestion-bodega-db --remote --file=./scripts/seed-datos.sql
//
// Nota: D1 no permite CREATE TEMP TABLE ni funciones de ventana en su "authorizer" de SQLite,
// así que en vez de numerar los registros recién insertados por posición, cada fila de
// asignaciones/mermas referencia su registro por codigo_unico (subconsulta simple y estable).

const codigosUsados = new Set();

function sufijo(longitud = 5) {
  const caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let s = '';
  for (let i = 0; i < longitud; i += 1) s += caracteres[Math.floor(Math.random() * caracteres.length)];
  return s;
}

function fechaCompacta(fecha) {
  const yyyy = fecha.getUTCFullYear();
  const mm = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function codigoUnico(prefijo, fecha) {
  let codigo;
  do {
    codigo = `${prefijo}-${fechaCompacta(fecha)}-${sufijo()}`;
  } while (codigosUsados.has(codigo));
  codigosUsados.add(codigo);
  return codigo;
}

function fechaHace(diasAtras, horaBase) {
  const f = new Date(horaBase);
  f.setUTCDate(f.getUTCDate() - diasAtras);
  return f;
}

function iso(fecha) {
  return fecha.toISOString();
}

function soloFecha(fecha) {
  return fecha.toISOString().slice(0, 10);
}

function esc(texto) {
  return String(texto).replace(/'/g, "''");
}

function sinTildes(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const ahora = new Date();

// ---------- Trabajadores ----------
const trabajadores = [
  { nombres: 'Rogelio Andrés', apellidos: 'Cisternas Vera', rut: '15899839-4', cargo: 'Jefe de Bodega', depto: 'Bodega' },
  { nombres: 'Ana', apellidos: 'Soto Rojas', rut: '18234567-8', cargo: 'Operadora de Bodega', depto: 'Bodega' },
  { nombres: 'Pedro', apellidos: 'Pérez Muñoz', rut: '17345678-5', cargo: 'Operador de Bodega', depto: 'Bodega' },
  { nombres: 'María José', apellidos: 'González Díaz', rut: '16456789-3', cargo: 'Supervisora de Logística', depto: 'Logística' },
  { nombres: 'Carlos', apellidos: 'Fuentes Silva', rut: '19567890-1', cargo: 'Técnico de Mantención', depto: 'Mantención' },
  { nombres: 'Javiera', apellidos: 'Torres Vargas', rut: '20678901-k', cargo: 'Asistente Administrativa', depto: 'Administración' },
  { nombres: 'Diego', apellidos: 'Ramírez Castro', rut: '14789012-9', cargo: 'Operador de Bodega', depto: 'Bodega' },
  { nombres: 'Camila', apellidos: 'Morales Espinoza', rut: '21890123-7', cargo: 'Analista de Inventario', depto: 'Logística' },
  { nombres: 'Felipe', apellidos: 'Herrera Contreras', rut: '13901234-2', cargo: 'Técnico de Mantención', depto: 'Mantención' },
  { nombres: 'Valentina', apellidos: 'Rojas Sepúlveda', rut: '22012345-6', cargo: 'Operadora de Bodega', depto: 'Bodega' },
];

// ---------- Catálogo de registros por tipo ----------
const catalogo = {
  MATERIAL: [
    ['Cemento en sacos de 25kg', 'SACO'],
    ['Fierro estriado 8mm', 'UNIDAD'],
    ['Pintura acrílica blanca', 'LITRO'],
    ['Arena gruesa', 'M3'],
    ['Ladrillos fiscales', 'UNIDAD'],
    ['Tablas de pino 2x4', 'UNIDAD'],
    ['Clavos de acero 3"', 'KG'],
    ['Cerámica para piso 45x45', 'M2'],
    ['Perfiles de aluminio', 'UNIDAD'],
    ['Cable eléctrico 2.5mm', 'ROLLO'],
    ['Tornillos autoperforantes', 'CAJA'],
    ['Yeso cartón 15mm', 'UNIDAD'],
  ],
  EQUIPO: [
    ['Notebook Dell Latitude', 'UNIDAD'],
    ['Taladro percutor Bosch', 'UNIDAD'],
    ['Impresora HP LaserJet', 'UNIDAD'],
    ['Proyector Epson', 'UNIDAD'],
    ['Router WiFi empresarial', 'UNIDAD'],
    ['Monitor LG 24 pulgadas', 'UNIDAD'],
    ['Silla ergonómica', 'UNIDAD'],
    ['Escritorio modular', 'UNIDAD'],
    ['Extintor PQS 6kg', 'UNIDAD'],
    ['Generador eléctrico portátil', 'UNIDAD'],
    ['Escáner de código de barras', 'UNIDAD'],
    ['Radio transmisor portátil', 'UNIDAD'],
  ],
  DOCUMENTO: [
    ['Contrato de arriendo bodega', 'UNIDAD'],
    ['Factura proveedor materiales', 'UNIDAD'],
    ['Manual técnico de equipos', 'UNIDAD'],
    ['Plano arquitectónico bodega', 'UNIDAD'],
    ['Certificado de garantía', 'UNIDAD'],
    ['Acta de reunión mensual', 'UNIDAD'],
    ['Póliza de seguro', 'UNIDAD'],
  ],
  OTRO: [
    ['Caja de herramientas', 'UNIDAD'],
    ['Kit de primeros auxilios', 'UNIDAD'],
    ['Uniforme de trabajo', 'UNIDAD'],
    ['Señalética de seguridad', 'UNIDAD'],
    ['Casco de seguridad', 'UNIDAD'],
    ['Guantes de trabajo', 'PAR'],
  ],
};

const tipos = Object.keys(catalogo);
const TOTAL_REGISTROS_NUEVOS = 168;
const TOTAL_ASIGNACIONES = 100;
const TOTAL_MERMAS = 20;

const lineas = [];
lineas.push('-- Seed de demostración: 10 trabajadores, 168 registros (+2 existentes = 170),');
lineas.push('-- 100 asignaciones y 20 mermas pendientes.');
lineas.push('');

// ---------- INSERT trabajadores ----------
lineas.push('-- Trabajadores');
lineas.push(
  'INSERT INTO trabajadores (rut, nombres, apellidos, cargo, departamento, email, activo, createdAt, updatedAt) VALUES'
);
const filasTrabajadores = trabajadores.map((t, i) => {
  const creado = iso(fechaHace(45 - i, ahora));
  const email = `${sinTildes(t.nombres.toLowerCase().split(' ')[0])}.${sinTildes(t.apellidos.toLowerCase().split(' ')[0])}@bodega-demo.cl`;
  return `  ('${t.rut}', '${esc(t.nombres)}', '${esc(t.apellidos)}', '${esc(t.cargo)}', '${esc(t.depto)}', '${email}', 1, '${creado}', '${creado}')`;
});
lineas.push(filasTrabajadores.join(',\n') + ';');
lineas.push('');

// ---------- Generar los 168 registros nuevos en memoria (para poder referenciarlos luego) ----------
const registrosNuevos = [];
for (let i = 0; i < TOTAL_REGISTROS_NUEVOS; i += 1) {
  const tipo = tipos[i % tipos.length];
  const opciones = catalogo[tipo];
  const [descripcion, unidad] = opciones[i % opciones.length];
  const diasAtras = Math.floor((i / TOTAL_REGISTROS_NUEVOS) * 30);
  const fecha = fechaHace(diasAtras, ahora);
  const codigo = codigoUnico('REG', fecha);
  const cantidad = 1 + Math.floor(Math.random() * 49);
  registrosNuevos.push({ codigo, tipo, descripcion, cantidad, unidad, fecha });
}

lineas.push('-- Registros de entrada (168 nuevos)');
lineas.push(
  'INSERT INTO registros_entrada (codigo_unico, tipo_registro, descripcion, cantidad, unidad_medida, estado, createdAt, updatedAt) VALUES'
);
lineas.push(
  registrosNuevos
    .map(
      (r) =>
        `  ('${r.codigo}', '${r.tipo}', '${esc(r.descripcion)}', ${r.cantidad}, '${r.unidad}', 'DISPONIBLE', '${iso(r.fecha)}', '${iso(r.fecha)}')`
    )
    .join(',\n') + ';'
);
lineas.push('');

// ---------- 100 asignaciones sobre los primeros 100 registros nuevos ----------
lineas.push('-- Asignaciones: 100 de los 168 registros nuevos, repartidos entre los 10 trabajadores');
lineas.push(
  'INSERT INTO asignaciones (codigo_unico, registroId, trabajadorId, fecha_asignacion, fecha_estimada_devolucion, estado, observaciones, createdAt, updatedAt) VALUES'
);
const filasAsignaciones = [];
for (let i = 0; i < TOTAL_ASIGNACIONES; i += 1) {
  const registro = registrosNuevos[i];
  const diasAtras = 20 - Math.floor((i / TOTAL_ASIGNACIONES) * 20);
  const fecha = fechaHace(diasAtras, ahora);
  const codigo = codigoUnico('ASIG', fecha);
  const devolucion = soloFecha(fechaHace(-1 * (5 + (i % 30)), ahora)); // fecha futura
  const trabajadorIndex = (i % 10) + 1;
  filasAsignaciones.push(
    `  ('${codigo}', (SELECT id FROM registros_entrada WHERE codigo_unico = '${registro.codigo}'), ${trabajadorIndex}, '${iso(fecha)}', '${devolucion}', 'ASIGNADO', NULL, '${iso(fecha)}', '${iso(fecha)}')`
  );
}
lineas.push(filasAsignaciones.join(',\n') + ';');
lineas.push('');

lineas.push("UPDATE registros_entrada SET estado = 'ASIGNADO', updatedAt = datetime('now')");
lineas.push(`WHERE codigo_unico IN (${registrosNuevos.slice(0, TOTAL_ASIGNACIONES).map((r) => `'${r.codigo}'`).join(', ')});`);
lineas.push('');

// ---------- 20 mermas sobre otros 20 registros nuevos (no asignados) ----------
const motivos = [
  'Producto dañado durante el traslado interno',
  'Humedad detectada en el almacenamiento',
  'Vencimiento del producto',
  'Rotura durante manipulación',
  'Defecto de fábrica detectado en inspección',
  'Pérdida de componentes durante inventario',
  'Daño por manipulación incorrecta de montacargas',
  'Exposición a condiciones climáticas adversas',
];

lineas.push('-- Mermas: 20 registros nuevos (no asignados), todas en estado PENDIENTE');
lineas.push(
  'INSERT INTO mermas (codigo_unico, registroId, cantidad, motivo, reportado_por, estado, evidencia_url, createdAt, updatedAt) VALUES'
);
const filasMermas = [];
for (let i = 0; i < TOTAL_MERMAS; i += 1) {
  const registro = registrosNuevos[TOTAL_ASIGNACIONES + i];
  const diasAtras = 15 - Math.floor((i / TOTAL_MERMAS) * 15);
  const fecha = fechaHace(diasAtras, ahora);
  const codigo = codigoUnico('MER', fecha);
  const motivo = motivos[i % motivos.length];
  const trabajador = trabajadores[(i + 3) % trabajadores.length];
  const reportadoPor = `${trabajador.nombres} ${trabajador.apellidos}`;
  const cantidad = 1 + Math.floor(Math.random() * 5);
  filasMermas.push(
    `  ('${codigo}', (SELECT id FROM registros_entrada WHERE codigo_unico = '${registro.codigo}'), ${cantidad}, '${esc(motivo)}', '${esc(reportadoPor)}', 'PENDIENTE', NULL, '${iso(fecha)}', '${iso(fecha)}')`
  );
}
lineas.push(filasMermas.join(',\n') + ';');

console.log(lineas.join('\n'));
