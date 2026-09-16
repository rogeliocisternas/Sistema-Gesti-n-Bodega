import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EstadoChip from '../components/EstadoChip';
import { useAuth } from '../auth/AuthContext';
import { listarAsignacionesPorTrabajador, devolverAsignacion } from '../api/asignaciones';
import { crearMerma } from '../api/mermas';

const formMermaInicial = { cantidad: '', motivo: '' };

export default function MisAsignacionesPage() {
  const { usuario } = useAuth();

  const [asignaciones, setAsignaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  const [asignacionMerma, setAsignacionMerma] = useState(null);
  const [formMerma, setFormMerma] = useState(formMermaInicial);

  const cargar = () => {
    if (!usuario?.trabajadorId) return;
    setCargando(true);
    listarAsignacionesPorTrabajador(usuario.trabajadorId)
      .then(setAsignaciones)
      .catch(() => setMensaje({ tipo: 'error', texto: 'No se pudieron cargar tus asignaciones' }))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.trabajadorId]);

  const manejarDevolver = async (id) => {
    try {
      await devolverAsignacion(id);
      setMensaje({ tipo: 'success', texto: 'Devolución registrada' });
      cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al registrar la devolución' });
    }
  };

  const manejarReportarMerma = async () => {
    try {
      await crearMerma({
        registroId: asignacionMerma.registroId,
        cantidad: Number(formMerma.cantidad),
        motivo: formMerma.motivo,
        reportado_por: usuario?.nombre || 'Trabajador',
      });
      setMensaje({ tipo: 'success', texto: 'Merma reportada correctamente' });
      setAsignacionMerma(null);
      setFormMerma(formMermaInicial);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al reportar la merma' });
    }
  };

  if (!usuario?.trabajadorId) {
    return (
      <Alert severity="warning">
        Tu sesión no tiene un trabajador asociado. Cierra sesión y vuelve a entrar eligiéndote de
        la lista de trabajadores.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Mis Asignaciones
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Activos actualmente a tu nombre. Puedes registrar la devolución o reportar una merma sobre
        cualquiera de ellos.
      </Typography>

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
                <TableCell>
                  {a.registro?.codigo_unico} — {a.registro?.descripcion}
                </TableCell>
                <TableCell>{new Date(a.fecha_asignacion).toLocaleDateString('es-CL')}</TableCell>
                <TableCell>{a.fecha_estimada_devolucion}</TableCell>
                <TableCell>
                  <EstadoChip estado={a.estado} />
                </TableCell>
                <TableCell align="right">
                  {a.estado === 'ASIGNADO' && (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" startIcon={<WarningAmberIcon />} onClick={() => setAsignacionMerma(a)}>
                        Reportar merma
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => manejarDevolver(a.id)}>
                        Devolver
                      </Button>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!cargando && asignaciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No tienes activos asignados actualmente
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!asignacionMerma} onClose={() => setAsignacionMerma(null)} fullWidth maxWidth="sm">
        <DialogTitle>Reportar Merma</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Registro
                </Typography>
                <Typography variant="subtitle2">
                  {asignacionMerma?.registro?.codigo_unico} — {asignacionMerma?.registro?.descripcion}
                </Typography>
              </CardContent>
            </Card>
            <TextField
              label="Cantidad"
              type="number"
              value={formMerma.cantidad}
              onChange={(e) => setFormMerma({ ...formMerma, cantidad: e.target.value })}
            />
            <TextField
              label="Motivo"
              multiline
              minRows={2}
              value={formMerma.motivo}
              onChange={(e) => setFormMerma({ ...formMerma, motivo: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAsignacionMerma(null)}>Cancelar</Button>
          <Button variant="contained" onClick={manejarReportarMerma} disabled={!formMerma.motivo || !formMerma.cantidad}>
            Enviar reporte
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
