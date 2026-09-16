/**
 * Exporta el contenido actual de la base de datos (SQLite) a un archivo
 * Excel de ejemplo, para revisar o compartir los datos sin necesitar
 * levantar la aplicación.
 *
 * Uso: npm run export:excel
 * Genera: data/ejemplo-bodega.xlsx
 */

const path = require('path');
const ExcelJS = require('exceljs');
const sequelize = require('../src/config/database');
const Registro = require('../src/models/Registro');
const Trabajador = require('../src/models/Trabajador');
const Asignacion = require('../src/models/Asignacion');

function autoAncho(sheet) {
  sheet.columns.forEach((column) => {
    let max = column.header ? String(column.header).length : 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? String(cell.value).length : 0;
      if (len > max) max = len;
    });
    column.width = Math.min(max + 2, 45);
  });
}

function estiloEncabezado(sheet) {
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF102A43' } };
}

async function exportar() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Gestión de Bodega';
  workbook.created = new Date();

  const trabajadores = await Trabajador.findAll({ raw: true });
  const registros = await Registro.findAll({ raw: true });
  const asignaciones = await Asignacion.findAll({ include: [Registro, Trabajador] });

  const hojaTrabajadores = workbook.addWorksheet('Trabajadores');
  hojaTrabajadores.columns = [
    { header: 'RUT', key: 'rut' },
    { header: 'Nombre completo', key: 'nombre_completo' },
    { header: 'Email', key: 'email' },
    { header: 'Departamento', key: 'departamento' },
    { header: 'Cargo', key: 'cargo' },
    { header: 'Estado', key: 'estado' }
  ];
  trabajadores.forEach((trabajador) => hojaTrabajadores.addRow(trabajador));
  estiloEncabezado(hojaTrabajadores);
  autoAncho(hojaTrabajadores);

  const hojaInventario = workbook.addWorksheet('Inventario');
  hojaInventario.columns = [
    { header: 'Código', key: 'codigo_unico' },
    { header: 'Tipo', key: 'tipo_registro' },
    { header: 'Descripción', key: 'descripcion' },
    { header: 'Cantidad', key: 'cantidad' },
    { header: 'Unidad de medida', key: 'unidad_medida' },
    { header: 'Estado', key: 'estado' }
  ];
  registros.forEach((registro) => hojaInventario.addRow(registro));
  estiloEncabezado(hojaInventario);
  autoAncho(hojaInventario);

  const hojaAsignaciones = workbook.addWorksheet('Asignaciones');
  hojaAsignaciones.columns = [
    { header: 'Código', key: 'codigo_asignacion' },
    { header: 'Trabajador', key: 'trabajador' },
    { header: 'RUT trabajador', key: 'rut' },
    { header: 'Artículo asignado', key: 'articulo' },
    { header: 'Fecha asignación', key: 'fecha_asignacion' },
    { header: 'Fecha estimada devolución', key: 'fecha_estimada_devolucion' },
    { header: 'Estado', key: 'estado' }
  ];
  asignaciones.forEach((asignacion) => hojaAsignaciones.addRow({
    codigo_asignacion: asignacion.codigo_asignacion,
    trabajador: asignacion.Trabajador?.nombre_completo || `#${asignacion.trabajadorId}`,
    rut: asignacion.Trabajador?.rut || '',
    articulo: asignacion.Registro?.descripcion || `#${asignacion.registroId}`,
    fecha_asignacion: asignacion.fecha_asignacion,
    fecha_estimada_devolucion: asignacion.fecha_estimada_devolucion,
    estado: asignacion.estado
  }));
  estiloEncabezado(hojaAsignaciones);
  autoAncho(hojaAsignaciones);

  const destino = path.join(__dirname, '../data/ejemplo-bodega.xlsx');
  await workbook.xlsx.writeFile(destino);
  console.log(`Excel de ejemplo generado en: ${destino}`);
}

exportar()
  .then(() => sequelize.close())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error al exportar a Excel:', error);
    process.exit(1);
  });
