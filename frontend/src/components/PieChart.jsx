import { Box, Stack, Typography } from '@mui/material';

const R = 70;
const STROKE = 32;
const CIRC = 2 * Math.PI * R;

// Donut (part-to-whole, <=6 categorías). Leyenda siempre presente (>=2 series) con
// valor y porcentaje directo — el texto nunca lleva el color de la serie, solo el
// swatch de al lado (ver dataviz skill, marks-and-anatomy.md).
export default function PieChart({ datos, vacio = 'Sin datos' }) {
  const total = datos.reduce((acc, d) => acc + d.valor, 0);

  if (total === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {vacio}
      </Typography>
    );
  }

  let acumulado = 0;
  const porciones = datos
    .filter((d) => d.valor > 0)
    .map((d) => {
      const fraccion = d.valor / total;
      const largo = fraccion * CIRC;
      const offset = acumulado;
      acumulado += largo;
      return { ...d, largo, offset, porcentaje: Math.round(fraccion * 100) };
    });

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
      <Box sx={{ position: 'relative', width: 176, height: 176, flexShrink: 0 }}>
        <Box component="svg" viewBox="0 0 176 176" width={176} height={176} role="img" aria-label="Mermas por tipo">
          <g transform="rotate(-90 88 88)">
            {porciones.map((p) => (
              <circle
                key={p.etiqueta}
                cx={88}
                cy={88}
                r={R}
                fill="none"
                stroke={p.color}
                strokeWidth={STROKE}
                strokeDasharray={`${p.largo} ${CIRC - p.largo}`}
                strokeDashoffset={-p.offset}
                tabIndex={0}
                aria-label={`${p.etiqueta}: ${p.valor} (${p.porcentaje}%)`}
              >
                <title>{`${p.etiqueta}: ${p.valor} (${p.porcentaje}%)`}</title>
              </circle>
            ))}
          </g>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            {total}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            total
          </Typography>
        </Box>
      </Box>

      <Stack spacing={1} sx={{ minWidth: 0, width: '100%' }}>
        {porciones.map((p) => (
          <Stack key={p.etiqueta} direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: p.color, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ flexGrow: 1 }} noWrap>
              {p.etiqueta}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {p.valor}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ width: 40, textAlign: 'right' }}>
              {p.porcentaje}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
