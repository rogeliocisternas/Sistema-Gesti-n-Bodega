// jsPDF y xlsx se cargan de forma diferida (import dinámico) para que no engorden
// el bundle principal de la app — solo se descargan cuando alguien exporta.

function formatearFechaHora(fecha) {
  return fecha.toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' });
}

function nombreArchivo(datos, extension) {
  return `reporte-bodega-${datos.generadoEn.toISOString().slice(0, 10)}.${extension}`;
}

const AZUL = [21, 101, 192];
const NARANJA = [230, 81, 0];

// Reporte PDF detallado: resumen ejecutivo + una sección por gráfico de la
// pantalla de Reportes, cada una en su propia tabla (jsPDF + jspdf-autotable,
// las mismas librerías que especifica el informe para el Módulo de Reportes).
export async function exportarReportePDF(datos) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margen = 40;
  let y = 50;

  const agregarSeccion = (titulo) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text(titulo, margen, y);
    y += 6;
  };

  const avanzarDespuesDeTabla = () => {
    y = doc.lastAutoTable.finalY + 24;
  };

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Sistema de Gestión de Bodega', margen, y);
  y += 22;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte Analítico', margen, y);
  y += 20;

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generado: ${formatearFechaHora(datos.generadoEn)}`, margen, y);
  y += 12;
  doc.text(`Filtros aplicados: Tipo = ${datos.filtros.tipo} · Período = últimos ${datos.filtros.periodoDias} días`, margen, y);
  y += 20;

  agregarSeccion('Resumen Ejecutivo');
  autoTable(doc, {
    startY: y,
    margin: { left: margen, right: margen },
    head: [['Indicador', 'Valor']],
    body: [
      ['Registros totales', String(datos.resumen.registrosTotales)],
      ['Activos asignados', String(datos.resumen.activosAsignados)],
      ['Disponibles', String(datos.resumen.disponibles)],
      ['Mermas pendientes', String(datos.resumen.mermasPendientes)],
      ['Mermas totales', String(datos.resumen.mermasTotales)],
      ['Tasa de errores (mermas / registros totales)', `${datos.resumen.tasaError.toFixed(1)}%`],
      ['Costo operativo estimado', `$${Math.round(datos.resumen.costoOperativo).toLocaleString('es-CL')}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: AZUL },
    styles: { fontSize: 9 },
  });
  avanzarDespuesDeTabla();

  agregarSeccion('Registros por Tipo y Mes');
  const nombresTipo = datos.porTipoYMes.series.map((s) => s.nombre);
  autoTable(doc, {
    startY: y,
    margin: { left: margen, right: margen },
    head: [['Mes', ...nombresTipo, 'Total']],
    body: datos.porTipoYMes.meses.map((mes, i) => {
      const valores = datos.porTipoYMes.series.map((s) => s.valores[i]);
      return [datos.formatearMes(mes), ...valores.map(String), String(valores.reduce((a, b) => a + b, 0))];
    }),
    theme: 'grid',
    headStyles: { fillColor: AZUL },
    styles: { fontSize: 9 },
  });
  avanzarDespuesDeTabla();

  agregarSeccion('Registros Creados por Día');
  autoTable(doc, {
    startY: y,
    margin: { left: margen, right: margen },
    head: [['Fecha', 'Cantidad']],
    body: datos.porDia.map((d) => [d.etiqueta, String(d.valor)]),
    theme: 'grid',
    headStyles: { fillColor: AZUL },
    styles: { fontSize: 9 },
  });
  avanzarDespuesDeTabla();

  agregarSeccion('Asignaciones por Trabajador');
  autoTable(doc, {
    startY: y,
    margin: { left: margen, right: margen },
    head: [['Trabajador', 'Activos asignados']],
    body: datos.porTrabajador.length
      ? datos.porTrabajador.map((t) => [t.etiqueta, String(t.valor)])
      : [['Sin asignaciones registradas', '']],
    theme: 'grid',
    headStyles: { fillColor: AZUL },
    styles: { fontSize: 9 },
  });
  avanzarDespuesDeTabla();

  agregarSeccion('Mermas por Tipo');
  const totalMermas = datos.mermasPorTipo.reduce((a, m) => a + m.valor, 0);
  autoTable(doc, {
    startY: y,
    margin: { left: margen, right: margen },
    head: [['Tipo', 'Cantidad', 'Porcentaje']],
    body: datos.mermasPorTipo.map((m) => [
      m.etiqueta,
      String(m.valor),
      totalMermas ? `${Math.round((m.valor / totalMermas) * 100)}%` : '0%',
    ]),
    theme: 'grid',
    headStyles: { fillColor: NARANJA },
    styles: { fontSize: 9 },
  });

  const totalPaginas = doc.internal.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    doc.setPage(pagina);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Sistema de Gestión de Bodega · Página ${pagina} de ${totalPaginas}`,
      margen,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  doc.save(nombreArchivo(datos, 'pdf'));
}

// Excel con una hoja de resumen, una hoja por gráfico, y dos hojas de detalle
// (registros y mermas en crudo) para análisis fuera de la aplicación.
export async function exportarReporteExcel(datos) {
  const XLSX = await import('xlsx');

  const wb = XLSX.utils.book_new();

  const hojaResumen = XLSX.utils.aoa_to_sheet([
    ['Sistema de Gestión de Bodega — Reporte Analítico'],
    [`Generado: ${formatearFechaHora(datos.generadoEn)}`],
    [`Filtros: Tipo = ${datos.filtros.tipo} · Período = últimos ${datos.filtros.periodoDias} días`],
    [],
    ['Indicador', 'Valor'],
    ['Registros totales', datos.resumen.registrosTotales],
    ['Activos asignados', datos.resumen.activosAsignados],
    ['Disponibles', datos.resumen.disponibles],
    ['Mermas pendientes', datos.resumen.mermasPendientes],
    ['Mermas totales', datos.resumen.mermasTotales],
    ['Tasa de errores (%)', Number(datos.resumen.tasaError.toFixed(1))],
    ['Costo operativo estimado (USD)', Math.round(datos.resumen.costoOperativo)],
  ]);
  hojaResumen['!cols'] = [{ wch: 40 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, hojaResumen, 'Resumen');

  const nombresTipo = datos.porTipoYMes.series.map((s) => s.nombre);
  const hojaTipos = XLSX.utils.aoa_to_sheet([
    ['Mes', ...nombresTipo, 'Total'],
    ...datos.porTipoYMes.meses.map((mes, i) => {
      const valores = datos.porTipoYMes.series.map((s) => s.valores[i]);
      return [datos.formatearMes(mes), ...valores, valores.reduce((a, b) => a + b, 0)];
    }),
  ]);
  XLSX.utils.book_append_sheet(wb, hojaTipos, 'Registros por tipo-mes');

  const hojaDias = XLSX.utils.aoa_to_sheet([
    ['Fecha', 'Cantidad'],
    ...datos.porDia.map((d) => [d.etiqueta, d.valor]),
  ]);
  XLSX.utils.book_append_sheet(wb, hojaDias, 'Registros por dia');

  const hojaTrabajadores = XLSX.utils.aoa_to_sheet([
    ['Trabajador', 'Activos asignados'],
    ...datos.porTrabajador.map((t) => [t.etiqueta, t.valor]),
  ]);
  XLSX.utils.book_append_sheet(wb, hojaTrabajadores, 'Asignaciones x trabajador');

  const totalMermas = datos.mermasPorTipo.reduce((a, m) => a + m.valor, 0);
  const hojaMermasTipo = XLSX.utils.aoa_to_sheet([
    ['Tipo', 'Cantidad', 'Porcentaje'],
    ...datos.mermasPorTipo.map((m) => [m.etiqueta, m.valor, totalMermas ? m.valor / totalMermas : 0]),
  ]);
  XLSX.utils.book_append_sheet(wb, hojaMermasTipo, 'Mermas por tipo');

  const hojaRegistrosDetalle = XLSX.utils.json_to_sheet(
    datos.registrosDetalle.map((r) => ({
      Código: r.codigo_unico,
      Tipo: r.tipo_registro,
      Descripción: r.descripcion,
      Cantidad: r.cantidad,
      Unidad: r.unidad_medida,
      Estado: r.estado,
      'Fecha creación': r.createdAt,
    }))
  );
  XLSX.utils.book_append_sheet(wb, hojaRegistrosDetalle, 'Detalle registros');

  const hojaMermasDetalle = XLSX.utils.json_to_sheet(
    datos.mermasDetalle.map((m) => ({
      Código: m.codigo_unico,
      Registro: m.registro?.codigo_unico || '',
      Descripción: m.registro?.descripcion || '',
      Cantidad: m.cantidad,
      Motivo: m.motivo,
      'Reportado por': m.reportado_por,
      Estado: m.estado,
      Fecha: m.createdAt,
    }))
  );
  XLSX.utils.book_append_sheet(wb, hojaMermasDetalle, 'Detalle mermas');

  XLSX.writeFile(wb, nombreArchivo(datos, 'xlsx'));
}
