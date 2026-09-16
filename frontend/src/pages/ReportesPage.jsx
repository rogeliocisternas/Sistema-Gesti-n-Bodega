import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import BarListChart from '../components/BarListChart';
import GroupedBarChart from '../components/GroupedBarChart';
import DailyLineChart from '../components/DailyLineChart';
import PieChart from '../components/PieChart';
import { listarRegistros } from '../api/registros';
import { listarTrabajadores } from '../api/trabajadores';
import { listarAsignaciones } from '../api/asignaciones';
import { listarMermas } from '../api/mermas';
import { COLOR_POR_TIPO, ORDEN_TIPOS } from '../theme/colores';

function agruparPorMesYTipo(registros) {
  const mesesSet = new Set();
  const porMesTipo = {};
  registros.forEach((r) => {
    const mes = r.createdAt?.slice(0, 7); // YYYY-MM
    if (!mes) return;
    mesesSet.add(mes);
    porMesTipo[mes] = porMesTipo[mes] || {};
    porMesTipo[mes][r.tipo_registro] = (porMesTipo[mes][r.tipo_registro] || 0) + 1;
  });
  const meses = Array.from(mesesSet).sort();
  const series = ORDEN_TIPOS.map((tipo) => ({
    nombre: tipo,
    color: COLOR_POR_TIPO[tipo],
    valores: meses.map((mes) => porMesTipo[mes]?.[tipo] || 0),
  }));
  return { meses, series };
}

function formatearMes(mesStr) {
  const [anio, mes] = mesStr.split('-').map(Number);
  const etiqueta = new Date(anio, mes - 1, 1).toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });
  return etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1);
}

function agruparPorDia(registros, dias) {
  const hoy = new Date();
  const cubos = [];
  for (let i = dias - 1; i >= 0; i -= 1) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    const iso = fecha.toISOString().slice(0, 10);
    const etiqueta = `${String(fecha.getDate()).padStart(2, '0')}/${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    cubos.push({ fecha: iso, etiqueta, valor: 0 });
  }
  registros.forEach((r) => {
    const fechaKey = r.createdAt?.slice(0, 10);
    const cubo = cubos.find((c) => c.fecha === fechaKey);
    if (cubo) cubo.valor += 1;
  });
  return cubos;
}

export default function ReportesPage() {
  const [registros, setRegistros] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [mermas, setMermas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [periodo, setPeriodo] = useState(7);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  useEffect(() => {
    let activo = true;
    Promise.all([listarRegistros(), listarTrabajadores(), listarAsignaciones(), listarMermas()])
      .then(([r, t, a, m]) => {
        if (!activo) return;
        setRegistros(r);
        setTrabajadores(t);
        setAsignaciones(a);
        setMermas(m);
      })
      .catch(() => {
        if (activo) {
          setRegistros([]);
          setTrabajadores([]);
          setAsignaciones([]);
          setMermas([]);
        }
      })
      .finally(() => activo && setCargando(false));
    return () => {
      activo = false;
    };
  }, []);

  const registrosFiltrados = useMemo(
    () => (filtroTipo === 'TODOS' ? registros : registros.filter((r) => r.tipo_registro === filtroTipo)),
    [registros, filtroTipo]
  );

  const porTipoYMes = useMemo(() => agruparPorMesYTipo(registrosFiltrados), [registrosFiltrados]);
  const porDia = useMemo(() => agruparPorDia(registrosFiltrados, periodo), [registrosFiltrados, periodo]);

  const porTrabajador = useMemo(() => {
    const base = {};
    asignaciones.forEach((a) => {
      base[a.trabajadorId] = (base[a.trabajadorId] || 0) + 1;
    });
    return trabajadores
      .map((t) => ({ etiqueta: `${t.nombres} ${t.apellidos}`, valor: base[t.id] || 0 }))
      .filter((d) => d.valor > 0)
      .sort((a, b) => b.valor - a.valor);
  }, [asignaciones, trabajadores]);

  const mermasPorTipo = useMemo(() => {
    const base = {};
    mermas.forEach((m) => {
      const clave = m.registro?.tipo_registro || 'SIN TIPO';
      base[clave] = (base[clave] || 0) + 1;
    });
    return ORDEN_TIPOS.map((tipo) => ({ etiqueta: tipo, valor: base[tipo] || 0, color: COLOR_POR_TIPO[tipo] }));
  }, [mermas]);

  const tiposDisponibles = useMemo(() => ['TODOS', ...new Set(registros.map((r) => r.tipo_registro))], [registros]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5">Reportes Analíticos</Typography>
        <Stack direction="row" spacing={2}>
          <TextField select size="small" label="Tipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} sx={{ minWidth: 160 }}>
            {tiposDisponibles.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Período" value={periodo} onChange={(e) => setPeriodo(Number(e.target.value))} sx={{ minWidth: 160 }}>
            <MenuItem value={7}>Últimos 7 días</MenuItem>
            <MenuItem value={30}>Últimos 30 días</MenuItem>
          </TextField>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Registros por tipo, por mes
              </Typography>
              <GroupedBarChart
                meses={porTipoYMes.meses}
                series={porTipoYMes.series}
                formatearCategoria={formatearMes}
                vacio={cargando ? 'Cargando…' : 'Sin registros'}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Registros creados por día ({periodo === 7 ? 'últimos 7 días' : 'últimos 30 días'})
              </Typography>
              <DailyLineChart datos={porDia} vacio={cargando ? 'Cargando…' : 'Sin registros'} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Asignaciones por trabajador
              </Typography>
              <BarListChart datos={porTrabajador} colorBarra="info.main" vacio={cargando ? 'Cargando…' : 'Sin asignaciones registradas'} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Mermas por tipo
              </Typography>
              <PieChart datos={mermasPorTipo} vacio={cargando ? 'Cargando…' : 'Sin mermas registradas'} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
