// Paleta categórica validada (CVD-safe, orden fijo — nunca reordenar por valor).
// Ver dataviz skill: references/palette.md. Cada tipo de registro mantiene el
// mismo color en todos los gráficos de la app (Registros y Mermas comparten "tipo").
export const COLOR_POR_TIPO = {
  MATERIAL: '#2a78d6',
  EQUIPO: '#eb6834',
  DOCUMENTO: '#1baf7a',
  OTRO: '#eda100',
};

export const ORDEN_TIPOS = ['MATERIAL', 'EQUIPO', 'DOCUMENTO', 'OTRO'];
