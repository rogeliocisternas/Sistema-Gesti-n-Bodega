import { Box, Stack, Tooltip, Typography } from '@mui/material';

const ALTURA = 160;
const ANCHO_BARRA = 16;

function redondearTope(n) {
  if (n <= 5) return 5;
  const potencia = 10 ** (String(Math.floor(n)).length - 1);
  return Math.ceil(n / potencia) * potencia;
}

// Gráfico de barras agrupadas: un grupo por mes, una barra por serie (tipo) dentro
// de cada grupo. Colores por identidad fija (nunca reordenados por valor).
export default function GroupedBarChart({ meses, series, formatearCategoria, vacio = 'Sin datos' }) {
  if (meses.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {vacio}
      </Typography>
    );
  }

  const maxReal = Math.max(1, ...series.flatMap((s) => s.valores));
  const max = redondearTope(maxReal);

  return (
    <Box>
      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
        {series.map((s) => (
          <Stack key={s.nombre} direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: s.color, flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary">
              {s.nombre}
            </Typography>
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" spacing={1.5}>
        <Stack justifyContent="space-between" sx={{ height: ALTURA, py: 0 }}>
          {[max, Math.round(max / 2), 0].map((v, i) => (
            <Typography key={`${v}-${i}`} variant="caption" color="text.disabled" sx={{ lineHeight: 1 }}>
              {v}
            </Typography>
          ))}
        </Stack>

        <Stack
          direction="row"
          spacing={3}
          alignItems="flex-end"
          flex={1}
          sx={{ height: ALTURA, borderBottom: '1px solid', borderColor: 'divider', minWidth: 0 }}
        >
          {meses.map((categoria, idx) => (
            <Stack
              key={categoria}
              direction="row"
              spacing="2px"
              alignItems="flex-end"
              justifyContent="center"
              sx={{ flex: 1, height: '100%' }}
            >
              {series.map((s) => {
                const valor = s.valores[idx];
                const alturaPx = valor > 0 ? Math.max(3, (valor / max) * ALTURA) : 0;
                return (
                  <Tooltip key={s.nombre} title={`${s.nombre} · ${formatearCategoria(categoria)}: ${valor}`}>
                    <Box
                      tabIndex={0}
                      role="img"
                      aria-label={`${s.nombre} ${formatearCategoria(categoria)}: ${valor}`}
                      sx={{
                        width: ANCHO_BARRA,
                        height: alturaPx,
                        bgcolor: s.color,
                        borderRadius: '3px 3px 0 0',
                        '&:focus-visible': { outline: '2px solid', outlineColor: 'text.primary', outlineOffset: 1 },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Stack direction="row" spacing={3} sx={{ mt: 0.5, pl: '28px' }}>
        {meses.map((categoria) => (
          <Typography key={categoria} variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: 'center' }} noWrap>
            {formatearCategoria(categoria)}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}
