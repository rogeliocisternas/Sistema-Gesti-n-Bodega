/**
 * Script de datos de ejemplo (seed) para Sistema de Gestión de Bodega.
 *
 * Llena la base de datos SQLite (data/gestion-bodega.sqlite) con trabajadores,
 * registros de inventario y asignaciones de ejemplo, usando los mismos
 * modelos Sequelize que usa la aplicación (garantiza datos consistentes
 * con las reglas de negocio: enums, unicidad de RUT/código, etc).
 *
 * Uso:
 *   npm run seed          -> agrega datos de ejemplo (no borra lo existente)
 *   npm run seed:reset    -> recrea las tablas desde cero y agrega los datos
 */

const sequelize = require('../src/config/database');
const Registro = require('../src/models/Registro');
const Trabajador = require('../src/models/Trabajador');
const Asignacion = require('../src/models/Asignacion');
const { generarCodigoRegistro, generarCodigoAsignacion } = require('../src/utils/codigoGenerator');

const reset = process.argv.includes('--reset');

function diasDesde(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

const TRABAJADORES = [
  { rut: '11111111-1', nombre_completo: 'Camila Rojas Soto', email: 'camila.rojas@bodega.cl', departamento: 'Operaciones', cargo: 'Jefa de Bodega' },
  { rut: '22222222-2', nombre_completo: 'Matías Fuentes Díaz', email: 'matias.fuentes@bodega.cl', departamento: 'Logística', cargo: 'Encargado de Despacho' },
  { rut: '33333333-3', nombre_completo: 'Valentina Muñoz Pérez', email: 'valentina.munoz@bodega.cl', departamento: 'Mantenimiento', cargo: 'Técnica de Terreno' },
  { rut: '44444444-4', nombre_completo: 'Sebastián Torres León', email: 'sebastian.torres@bodega.cl', departamento: 'TI', cargo: 'Soporte Técnico' },
  { rut: '55555555-5', nombre_completo: 'Francisca Herrera Vidal', email: 'francisca.herrera@bodega.cl', departamento: 'Administración', cargo: 'Asistente Administrativa' },
  { rut: '66666666-6', nombre_completo: 'Diego Contreras Silva', email: 'diego.contreras@bodega.cl', departamento: 'Operaciones', cargo: 'Operario de Bodega' }
];

const REGISTROS = [
  { tipo_registro: 'EQUIPO', descripcion: 'Notebook Dell Latitude 5440', cantidad: 8, unidad_medida: 'UNIDAD', estado: 'DISPONIBLE' },
  { tipo_registro: 'EQUIPO', descripcion: 'Taladro percutor Bosch GSB 550', cantidad: 5, unidad_medida: 'UNIDAD', estado: 'DISPONIBLE' },
  { tipo_registro: 'EQUIPO', descripcion: 'Radio portátil Motorola CP200', cantidad: 12, unidad_medida: 'UNIDAD', estado: 'DISPONIBLE' },
  { tipo_registro: 'MATERIAL', descripcion: 'Cable eléctrico 3x2.5mm', cantidad: 300, unidad_medida: 'METRO', estado: 'DISPONIBLE' },
  { tipo_registro: 'MATERIAL', descripcion: 'Guantes de seguridad talla L', cantidad: 150, unidad_medida: 'PAR', estado: 'DISPONIBLE' },
  { tipo_registro: 'MATERIAL', descripcion: 'Cascos de seguridad blancos', cantidad: 40, unidad_medida: 'UNIDAD', estado: 'DISPONIBLE' },
  { tipo_registro: 'DOCUMENTO', descripcion: 'Manual de procedimientos de bodega v2', cantidad: 1, unidad_medida: 'UNIDAD', estado: 'DISPONIBLE' },
  { tipo_registro: 'EQUIPO', descripcion: 'Impresora térmica Zebra ZD230', cantidad: 3, unidad_medida: 'UNIDAD', estado: 'EN_MANTENIMIENTO' },
  { tipo_registro: 'EQUIPO', descripcion: 'Escáner de código de barras Honeywell', cantidad: 6, unidad_medida: 'UNIDAD', estado: 'DISPONIBLE' },
  { tipo_registro: 'OTRO', descripcion: 'Extintor PQS 6 kilos', cantidad: 10, unidad_medida: 'UNIDAD', estado: 'BAJA' }
];

async function seed() {
  await sequelize.sync(reset ? { force: true } : {});

  // Trabajadores (idempotente por RUT único)
  const trabajadores = [];
  for (const datos of TRABAJADORES) {
    const [trabajador] = await Trabajador.findOrCreate({ where: { rut: datos.rut }, defaults: datos });
    trabajadores.push(trabajador);
  }

  // Registros de inventario (idempotente por descripción, ya que el código se genera solo)
  const registros = [];
  for (const datos of REGISTROS) {
    let registro = await Registro.findOne({ where: { descripcion: datos.descripcion } });
    if (!registro) {
      registro = await Registro.create({ ...datos, codigo_unico: generarCodigoRegistro() });
    }
    registros.push(registro);
  }

  // Asignaciones de ejemplo: algunas activas, una devuelta, una atrasada.
  const yaHayAsignaciones = await Asignacion.count();
  if (yaHayAsignaciones === 0) {
    const [notebook, taladro, radio, , , , , , escaner] = registros;
    const [camila, matias, valentina, sebastian] = trabajadores;

    await Asignacion.create({
      codigo_asignacion: generarCodigoAsignacion(),
      trabajadorId: matias.id,
      registroId: notebook.id,
      fecha_asignacion: diasDesde(-5),
      fecha_estimada_devolucion: diasDesde(9),
      estado: 'ACTIVA'
    });
    notebook.estado = 'ASIGNADO';
    await notebook.save();

    await Asignacion.create({
      codigo_asignacion: generarCodigoAsignacion(),
      trabajadorId: valentina.id,
      registroId: taladro.id,
      fecha_asignacion: diasDesde(-20),
      fecha_estimada_devolucion: diasDesde(-6),
      estado: 'ATRASADA'
    });
    taladro.estado = 'ASIGNADO';
    await taladro.save();

    await Asignacion.create({
      codigo_asignacion: generarCodigoAsignacion(),
      trabajadorId: sebastian.id,
      registroId: escaner.id,
      fecha_asignacion: diasDesde(-15),
      fecha_estimada_devolucion: diasDesde(-1),
      estado: 'DEVUELTA'
    });
    // El escáner ya fue devuelto, por lo tanto sigue DISPONIBLE.

    await Asignacion.create({
      codigo_asignacion: generarCodigoAsignacion(),
      trabajadorId: camila.id,
      registroId: radio.id,
      fecha_asignacion: diasDesde(-2),
      fecha_estimada_devolucion: diasDesde(12),
      estado: 'ACTIVA'
    });
    radio.estado = 'ASIGNADO';
    await radio.save();
  }

  console.log('Datos de ejemplo cargados:');
  console.log(`  Trabajadores: ${await Trabajador.count()}`);
  console.log(`  Registros de inventario: ${await Registro.count()}`);
  console.log(`  Asignaciones: ${await Asignacion.count()}`);
}

seed()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error al cargar datos de ejemplo:', error);
    process.exit(1);
  });
