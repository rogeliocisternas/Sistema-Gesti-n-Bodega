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
import DatosEjemploChip from '../components/DatosEjemploChip';
import { listarRegistros } from '../api/registros';
import { listarTrabajadores } from '../api/trabajadores';
import { listarAsignacionesPorTrabajador } from '../api/asignaciones';
import { mermasPorTipoEjemplo } from '../data/datosEjemplo';

function agruparPorTipo(registros) {
  const base = {};
  registros.forEach((r) => {
    base[r.tipo_registro] = (base[r.tipo_registro] || 0) + 1;
  });
  return Object.entries(base).map(([etiqueta, valor]) => ({ etiqueta, valor }));
}

function agruparPorPeriodo(registros, dias) {
  const hoy = new Date();
  const cubos = [];
  for (let i = dias - 1; i >= 0; i -= 1) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - i);
    cubos.push({ etiqueta: fecha.toISOString().slice(5, 10), valor: 0 });
  }
  registros.forEach((r) => {
    const clave = r.createdAt?.slice(5, 10);
    const cubo = cubos.find((c) => c.etiqueta === clave);
    if (cubo) cubo.valor += 1;
  });
  return cubos;
}

export default function ReportesPage() {
  const [registros, setRegistros] = useState([]);
  const [porTrabajador, setPorTrabajador] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [periodo, setPeriodo] = useState(7);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const [listaRegistros, trabajadores] = await Promise.all([listarRegistros(), listarTrabajadores()]);
        if (!activo) return;
        setRegistros(listaRegistros);

        const conteos = await Promise.all(
          trabajadores.map(async (t) => {
            try {
              const asignaciones = await listarAsignacionesPorTrabajador(t.id);
              return { etiqueta: `${t.nombres} ${t.apellidos}`, valor: asignaciones.length };
            } catch {
              return { etiqueta: `${t.nombres} ${t.apellidos}`, valor: 0 };
            }
          })
        );
        if (activo) setPorTrabajador(conteos.filter((c) => c.valor > 0).sort((a, b) => b.valor - a.valor));
      } catch {
        if (activo) {
          setRegistros([]);
          setPorTrabajador([]);
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const registrosFiltrados = useMemo(
    () => (filtroTipo === 'TODOS' ? registros : registros.filter((r) => r.tipo_registro === filtroTipo)),
    [registros, filtroTipo]
  );

  const porTipo = useMemo(() => agruparPorTipo(registrosFiltrados), [registrosFiltrados]);
  const porPeriodo = useMemo(() => agruparPorPeriodo(registrosFiltrados, periodo), [registrosFiltrados, periodo]);

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
                Registros por tipo
              </Typography>
              <BarListChart datos={porTipo} vacio={cargando ? 'Cargando…' : 'Sin registros'} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Registros creados por día ({periodo === 7 ? 'últimos 7 días' : 'últimos 30 días'})
              </Typography>
              <BarListChart datos={porPeriodo} colorBarra="secondary.main" vacio={cargando ? 'Cargando…' : 'Sin registros'} />
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
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Mermas por tipo
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
