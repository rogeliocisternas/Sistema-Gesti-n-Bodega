import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Alert,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useAuth, ROLES } from '../auth/AuthContext';
import { listarMermas, crearMerma, aprobarMerma, rechazarMerma } from '../api/mermas';
import { listarRegistros } from '../api/registros';

const ESTADO_COLOR = { PENDIENTE: 'warning', APROBADA: 'success', RECHAZADA: 'default' };

const formInicial = { registroId: '', cantidad: '', motivo: '', evidenciaUrl: null, evidenciaNombre: '' };

export default function MermasPage() {
  const { usuario } = useAuth();
  const puedeAprobar = usuario?.rol === ROLES.ADMIN;

  const [mermas, setMermas] = useState([]);
  const [registrosDisponibles, setRegistrosDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [mensaje, setMensaje] = useState(null);

  const cargarMermas = () => {
    setCargando(true);
    listarMermas()
      .then(setMermas)
      .catch(() => setMensaje({ tipo: 'error', texto: 'No se pudieron cargar las mermas' }))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarMermas();
  }, []);

  const abrirDialogo = async () => {
    try {
      const registros = await listarRegistros();
      setRegistrosDisponibles(registros);
      setDialogAbierto(true);
    } catch {
      setMensaje({ tipo: 'error', texto: 'No se pudieron cargar los registros' });
    }
  };

  const manejarArchivo = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setForm((prev) => ({ ...prev, evidenciaUrl: URL.createObjectURL(archivo), evidenciaNombre: archivo.name }));
  };

  const manejarCrear = async () => {
    try {
      await crearMerma({
        registroId: Number(form.registroId),
        cantidad: Number(form.cantidad),
        motivo: form.motivo,
        reportado_por: usuario?.nombre || 'Usuario',
      });
      setForm(formInicial);
      setDialogAbierto(false);
      setMensaje({ tipo: 'success', texto: 'Merma reportada correctamente' });
      cargarMermas();
    } catch (err) {
      const texto = err.response?.data?.error || 'Error al reportar la merma';
      setMensaje({ tipo: 'error', texto });
    }
  };

  const manejarAprobar = async (id) => {
    try {
      await aprobarMerma(id);
      setMensaje({ tipo: 'success', texto: 'Merma aprobada' });
      cargarMermas();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al aprobar' });
    }
  };

  const manejarRechazar = async (id) => {
    try {
      await rechazarMerma(id);
      setMensaje({ tipo: 'success', texto: 'Merma rechazada' });
      cargarMermas();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al rechazar' });
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Control de Mermas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirDialogo}>
          Reportar Merma
        </Button>
      </Stack>

      {!puedeAprobar && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Tu rol (Operador) puede reportar mermas. Solo un Administrador puede aprobarlas o
          rechazarlas.
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Evidencia</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Registro</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Reportado por</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              {puedeAprobar && <TableCell align="right">Acción</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {mermas.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell>
                  <Avatar variant="rounded" src={m.evidencia_url || undefined} sx={{ bgcolor: 'grey.200' }}>
                    <PhotoCameraIcon fontSize="small" color="disabled" />
                  </Avatar>
                </TableCell>
                <TableCell>{m.codigo_unico}</TableCell>
                <TableCell>
                  {m.registro?.codigo_unico}
                  <Typography variant="caption" display="block" color="text.secondary">
                    {m.registro?.descripcion}
                  </Typography>
                </TableCell>
                <TableCell align="right">{m.cantidad}</TableCell>
                <TableCell>{m.motivo}</TableCell>
                <TableCell>{m.reportado_por}</TableCell>
                <TableCell>{new Date(m.createdAt).toLocaleDateString('es-CL')}</TableCell>
                <TableCell>
                  <Chip size="small" label={m.estado} color={ESTADO_COLOR[m.estado]} />
                </TableCell>
                {puedeAprobar && (
                  <TableCell align="right">
                    {m.estado === 'PENDIENTE' && (
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Aprobar">
                          <IconButton size="small" color="success" onClick={() => manejarAprobar(m.id)}>
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rechazar">
                          <IconButton size="small" color="error" onClick={() => manejarRechazar(m.id)}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!cargando && mermas.length === 0 && (
              <TableRow>
                <TableCell colSpan={puedeAprobar ? 9 : 8} align="center">
                  Sin mermas registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogAbierto} onClose={() => setDialogAbierto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reportar Merma</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Registro afectado"
              value={form.registroId}
              onChange={(e) => setForm({ ...form, registroId: e.target.value })}
            >
              {registrosDisponibles.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.codigo_unico} — {r.descripcion}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Cantidad"
              type="number"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            />
            <TextField
              label="Motivo"
              multiline
              minRows={2}
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
            />
            <Button component="label" variant="outlined" startIcon={<PhotoCameraIcon />}>
              {form.evidenciaNombre || 'Adjuntar evidencia fotográfica'}
              <input type="file" accept="image/*" hidden onChange={manejarArchivo} />
            </Button>
            {form.evidenciaUrl && (
              <Box
                component="img"
                src={form.evidenciaUrl}
                alt="Vista previa de evidencia"
                sx={{ maxHeight: 160, borderRadius: 1, objectFit: 'cover' }}
              />
            )}
            <Typography variant="caption" color="text.secondary">
              Prototipo: la foto solo se previsualiza en el navegador, no se sube a ningún
              almacenamiento todavía (el registro de la merma en la base de datos sí es real).
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAbierto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={manejarCrear} disabled={!form.registroId || !form.motivo || !form.cantidad}>
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
