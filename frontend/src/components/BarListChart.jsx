import { Box, Stack, Typography } from '@mui/material';

// Gráfico de barras horizontales minimalista (sin dependencias externas de charting).
export default function BarListChart({ datos, colorBarra = 'primary.main', vacio = 'Sin datos' }) {
  const max = Math.max(1, ...datos.map((d) => d.valor));

  if (datos.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {vacio}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {datos.map((d) => (
        <Box key={d.etiqueta}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="body2">{d.etiqueta}</Typography>
            <Typography variant="body2" fontWeight={600}>
              {d.valor}
            </Typography>
          </Stack>
          <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${Math.max(2, (d.valor / max) * 100)}%`,
                bgcolor: colorBarra,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
