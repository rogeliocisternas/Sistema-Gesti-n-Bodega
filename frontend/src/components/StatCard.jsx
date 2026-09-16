import { Box, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';

export default function StatCard({
  icono,
  etiqueta,
  valor,
  detalle,
  delta,
  deltaFavorable = true,
  color = 'primary.main',
  to,
}) {
  const navigate = useNavigate();

  const contenido = (
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: color,
            color: 'common.white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icono}
        </Box>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary" noWrap>
              {etiqueta}
            </Typography>
            {to && <ChevronRightIcon fontSize="small" color="disabled" />}
          </Stack>
          <Typography variant="h5" fontWeight={700}>
            {valor}
          </Typography>
          {detalle && (
            <Typography variant="caption" color="text.secondary">
              {detalle}
            </Typography>
          )}
          {delta && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
              {deltaFavorable ? (
                <TrendingDownIcon fontSize="inherit" color="success" />
              ) : (
                <TrendingUpIcon fontSize="inherit" color="error" />
              )}
              <Typography variant="caption" color={deltaFavorable ? 'success.main' : 'error.main'} fontWeight={600}>
                {delta}
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    </CardContent>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        ...(to && {
          '&:hover': { boxShadow: 2, borderColor: 'primary.main' },
        }),
      }}
    >
      {to ? (
        <CardActionArea onClick={() => navigate(to)} sx={{ height: '100%' }}>
          {contenido}
        </CardActionArea>
      ) : (
        contenido
      )}
    </Card>
  );
}
