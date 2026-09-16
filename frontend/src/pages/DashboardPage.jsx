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
import { listarRegistros } from '../api/registros';
import { listarAsignaciones } from '../api/asignaciones';
import { listarMermas } from '../api/mermas';
import { indicadoresInforme } from '../data/datosEjemplo';
import { calcularCostoOperativo, calcularTasaError } from '../utils/indicadores';

export default function DashboardPage() {
  const [registros, setRegistros] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [mermas, setMermas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    Promise.all([listarRegistros(), listarAsignaciones(), listarMermas()])
      .then(([r, a, m]) => {
        if (!activo) return;
        setRegistros(r);
        setAsignaciones(a);
        setMermas(m);
      })
      .catch(() => {
        if (activo) {
          setRegistros([]);
          setAsignaciones([]);
          setMermas([]);
        }
      })
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
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

  const mermasPendientes = useMemo(() => mermas.filter((m) => m.estado === 'PENDIENTE'), [mermas]);

  const mermasPorTipo = useMemo(() => {
    const base = {};
    mermas.forEach((m) => {
      const clave = m.registro?.tipo_registro || 'SIN TIPO';
      base[clave] = (base[clave] || 0) + 1;
    });
    return Object.entries(base).map(([etiqueta, valor]) => ({ etiqueta, valor }));
  }, [mermas]);

  const tasaError = useMemo(
    () => calcularTasaError({ registrosTotales: registros.length, mermasTotales: mermas.length }),
    [registros, mermas]
  );

  const costoOperativo = useMemo(
    () =>
      calcularCostoOperativo({
        registrosTotales: registros.length,
        asignacionesTotales: asignaciones.length,
        mermasTotales: mermas.length,
      }),
    [registros, asignaciones, mermas]
  );

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Typography variant="h5">Dashboard Principal</Typography>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icono={<Inventory2Icon />}
            etiqueta="Registros totales"
            valor={cargando ? '…' : registros.length}
            detalle="Dato real (GET /api/registros)"
            color="primary.main"
            to="/registros"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icono={<AssignmentTurnedInIcon />}
            etiqueta="Activos asignados"
            valor={cargando ? '…' : conteoPorEstado.ASIGNADO}
            detalle={`${cargando ? '…' : conteoPorEstado.DISPONIBLE} disponibles`}
            color="secondary.main"
            to="/asignaciones"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icono={<WarningAmberIcon />}
            etiqueta="Mermas pendientes"
            valor={cargando ? '…' : mermasPendientes.length}
            detalle="Dato real (GET /api/mermas)"
            color="warning.main"
            to="/mermas"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icono={<TimerIcon />}
            etiqueta="Tiempo por registro"
            valor={`${indicadoresInforme.tiempoPorRegistroSistema} min`}
            delta={`-${indicadoresInforme.tiempoPorRegistroActual - indicadoresInforme.tiempoPorRegistroSistema} min vs. proceso manual`}
            detalle="Meta de diseño (RF-01 / OE-1)"
            color="success.main"
            to="/registros"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icono={<RuleIcon />}
            etiqueta="Tasa de errores"
            valor={cargando ? '…' : `${tasaError.toFixed(1)}%`}
            detalle="Mermas / registros totales (real)"
            color="info.main"
            to="/reportes"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icono={<SavingsIcon />}
            etiqueta="Costo operativo estimado"
            valor={cargando ? '…' : `$${costoOperativo.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`}
            detalle="Según volumen real en la base de datos"
            color="success.dark"
            to="/reportes"
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
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Mermas por tipo
              </Typography>
              <BarListChart datos={mermasPorTipo} colorBarra="warning.main" vacio={cargando ? 'Cargando…' : 'Sin mermas registradas'} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
