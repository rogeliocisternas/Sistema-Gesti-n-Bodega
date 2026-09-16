import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Snackbar,
  Alert,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EstadoChip from '../components/EstadoChip';
import { obtenerTrabajadorPorRut } from '../api/trabajadores';
import { listarRegistros } from '../api/registros';
import { crearAsignacion, listarAsignacionesPorTrabajador, devolverAsignacion } from '../api/asignaciones';

const formInicial = { registroId: '', fecha_estimada_devolucion: '', observaciones: '' };

export default function AsignacionesPage() {
  const [rutBuscado, setRutBuscado] = useState('');
  const [trabajador, setTrabajador] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);
  const [registrosDisponibles, setRegistrosDisponibles] = useState([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [mensaje, setMensaje] = useState(null);

  const cargarAsignaciones = async (trabajadorId) => {
    const data = await listarAsignacionesPorTrabajador(trabajadorId);
    setAsignaciones(data);
  };

  const buscarTrabajador = async () => {
    if (!rutBuscado.trim()) return;
    try {
      const t = await obtenerTrabajadorPorRut(rutBuscado.trim());
      setTrabajador(t);
      await cargarAsignaciones(t.id);
    } catch (err) {
      setTrabajador(null);
      setAsignaciones([]);
      setMensaje({ tipo: 'error', texto: 'No se encontró un trabajador con ese RUT' });
    }
  };

  const abrirDialogo = async () => {
    try {
      const disponibles = await listarRegistros({ estado: 'DISPONIBLE' });
      setRegistrosDisponibles(disponibles);
      setDialogAbierto(true);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'No se pudieron cargar los registros disponibles' });
    }
  };

  const manejarCrear = async () => {
    try {
      await crearAsignacion({
        registroId: Number(form.registroId),
        trabajadorId: trabajador.id,
        fecha_estimada_devolucion: form.fecha_estimada_devolucion,
        observaciones: form.observaciones,
      });
      setDialogAbierto(false);
      setForm(formInicial);
      setMensaje({ tipo: 'success', texto: 'Asignación creada correctamente' });
      await cargarAsignaciones(trabajador.id);
    } catch (err) {
      const texto = err.response?.data?.error || 'Error al crear la asignación';
      setMensaje({ tipo: 'error', texto });
    }
  };

  const manejarDevolver = async (id) => {
    try {
      await devolverAsignacion(id);
      setMensaje({ tipo: 'success', texto: 'Asignación devuelta correctamente' });
      await cargarAsignaciones(trabajador.id);
    } catch (err) {
      const texto = err.response?.data?.error || 'Error al registrar la devolución';
      setMensaje({ tipo: 'error', texto });
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Asignaciones a Trabajadores
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar trabajador por RUT (ej: 15899839-4)"
          value={rutBuscado}
          onChange={(e) => setRutBuscado(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && buscarTrabajador()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ cursor: 'pointer' }} onClick={buscarTrabajador} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {trabajador && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">
                  {trabajador.nombres} {trabajador.apellidos}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  RUT: {trabajador.rut} · {trabajador.cargo || 'Sin cargo'}
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<AddIcon />} onClick={abrirDialogo}>
                Nueva Asignación
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {trabajador && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Código Asignación</TableCell>
                <TableCell>Registro</TableCell>
                <TableCell>Fecha Asignación</TableCell>
                <TableCell>Fecha Est. Devolución</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asignaciones.map((a) => (
                <TableRow key={a.id} hover>
                  <TableCell>{a.codigo_unico}</TableCell>
                  <TableCell>{a.registro?.codigo_unico} — {a.registro?.descripcion}</TableCell>
                  <TableCell>{new Date(a.fecha_asignacion).toLocaleDateString('es-CL')}</TableCell>
                  <TableCell>{a.fecha_estimada_devolucion}</TableCell>
                  <TableCell>
                    <EstadoChip estado={a.estado} />
                  </TableCell>
                  <TableCell align="right">
                    {a.estado === 'ASIGNADO' && (
                      <Button size="small" onClick={() => manejarDevolver(a.id)}>
                        Devolver
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {asignaciones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Este trabajador no tiene asignaciones
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogAbierto} onClose={() => setDialogAbierto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nueva Asignación</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Registro disponible"
              value={form.registroId}
              onChange={(e) => setForm({ ...form, registroId: e.target.value })}
            >
              {registrosDisponibles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.codigo_unico} — {r.descripcion}
                </MenuItem>
              ))}
              {registrosDisponibles.length === 0 && (
                <MenuItem disabled value="">
                  No hay registros disponibles
                </MenuItem>
              )}
            </TextField>
            <TextField
              label="Fecha estimada de devolución"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.fecha_estimada_devolucion}
              onChange={(e) => setForm({ ...form, fecha_estimada_devolucion: e.target.value })}
            />
            <TextField
              label="Observaciones"
              multiline
              minRows={2}
              value={form.observaciones}
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAbierto(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={manejarCrear}
            disabled={!form.registroId || !form.fecha_estimada_devolucion}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!mensaje} autoHideDuration={4000} onClose={() => setMensaje(null)}>
        <Alert severity={mensaje?.tipo} onClose={() => setMensaje(null)}>
          {mensaje?.texto}
        </Alert>
      </Snackbar>
    </Box>
  );
}
