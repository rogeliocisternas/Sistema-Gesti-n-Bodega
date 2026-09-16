import { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TimerIcon from '@mui/icons-material/Timer';
import RuleIcon from '@mui/icons-material/Rule';
import SavingsIcon from '@mui/icons-material/Savings';
import StatCard from '../components/StatCard';
import BarListChart from '../components/BarListChart';
import DatosEjemploChip from '../components/DatosEjemploChip';
import { listarRegistros } from '../api/registros';
import { indicadoresInforme, mermasPorTipoEjemplo } from '../data/datosEjemplo';

export default function DashboardPage() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarRegistros()
      .then(setRegistros)
      .catch(() => setRegistros([]))
      .finally(() => setCargando(false));
  }, []);

  const conteoPorEstado = useMemo(() => {
    const base = { DISPONIBLE: 0, ASIGNADO: 0, EN_MANTENIMIENTO: 0, BAJA: 0 };
    registros.forEach((r) => {
      base[r.estado] = (base[r.estado] || 0) + 1;
    });
    return base;
  }, [registros]);

  const registrosPorTipo = useMemo(() => {
    const base = {};
    registros.forEach((r) => {
      base[r.tipo_registro] = (base[r.tipo_registro] || 0) + 1;
    });
    return Object.entries(base).map(([etiqueta, valor]) => ({ etiqueta, valor }));
  }, [registros]);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Typography variant="h5">Dashboard Principal</Typography>
        <DatosEjemploChip />
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icono={<Inventory2Icon />}
            etiqueta="Registros totales"
            valor={cargando ? '…' : registros.length}
            detalle="Dato real (GET /api/registros)"
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icono={<AssignmentTurnedInIcon />}
            etiqueta="Activos asignados"
            valor={cargando ? '…' : conteoPorEstado.ASIGNADO}
            detalle={`${cargando ? '…' : conteoPorEstado.DISPONIBLE} disponibles`}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icono={<WarningAmberIcon />}
            etiqueta="Mermas pendientes"
            valor={mermasPorTipoEjemplo.reduce((acc, m) => acc + m.valor, 0)}
            detalle="Ejemplo — módulo de Mermas"
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icono={<TimerIcon />}
            etiqueta="Tiempo por registro"
            valor={`${indicadoresInforme.tiempoPorRegistroSistema} min`}
            delta={`-${indicadoresInforme.tiempoPorRegistroActual - indicadoresInforme.tiempoPorRegistroSistema} min vs. proceso manual`}
            color="success.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icono={<RuleIcon />}
            etiqueta="Tasa de errores"
            valor={`< ${indicadoresInforme.tasaErroresSistema}%`}
            delta={`-${indicadoresInforme.tasaErroresActual - indicadoresInforme.tasaErroresSistema} pp vs. manual`}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icono={<SavingsIcon />}
            etiqueta="Costo anual operativo"
            valor={`$${indicadoresInforme.costoAnualSistema.toLocaleString('es-CL')}`}
            delta={`-$${(indicadoresInforme.costoAnualActual - indicadoresInforme.costoAnualSistema).toLocaleString('es-CL')} vs. manual`}
            color="success.dark"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Registros por tipo
              </Typography>
              <BarListChart datos={registrosPorTipo} vacio={cargando ? 'Cargando…' : 'Sin registros aún'} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Mermas por tipo (últimos 30 días)
                </Typography>
                <DatosEjemploChip />
              </Stack>
              <BarListChart datos={mermasPorTipoEjemplo} colorBarra="warning.main" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
