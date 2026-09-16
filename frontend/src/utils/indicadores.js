// Indicadores calculados a partir de los datos reales de la base (no de ejemplo).
// Las tarifas usadas son las mismas del análisis económico del informe (Sección 3.2.2):
// $15 USD/hora y $3 USD por caso de merma/error de inventario.
const TARIFA_HORA_USD = 15;
const MINUTOS_POR_OPERACION = 2; // meta de tiempo por operación con el sistema (RF-01 / OE-1)
const COSTO_POR_MERMA_USD = 3;

export function calcularTasaError({ registrosTotales, mermasTotales }) {
  if (!registrosTotales) return 0;
  return (mermasTotales / registrosTotales) * 100;
}

// Costo operativo estimado para el volumen de datos actualmente registrado en el sistema
// (no es una proyección de planificación como la de la Sección 6.2 del informe, sino un
// cálculo directo sobre los totales reales: registros + asignaciones × tiempo por operación,
// más el costo de gestión de las mermas reportadas).
export function calcularCostoOperativo({ registrosTotales, asignacionesTotales, mermasTotales }) {
  const horas = ((registrosTotales + asignacionesTotales) * MINUTOS_POR_OPERACION) / 60;
  const costoTiempo = horas * TARIFA_HORA_USD;
  const costoMermas = mermasTotales * COSTO_POR_MERMA_USD;
  return costoTiempo + costoMermas;
}
