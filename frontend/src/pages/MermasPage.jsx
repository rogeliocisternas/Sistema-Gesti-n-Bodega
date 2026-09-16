import { useState } from 'react';
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
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DatosEjemploChip from '../components/DatosEjemploChip';
import { useAuth, ROLES } from '../auth/AuthContext';
import { mermasEjemplo } from '../data/datosEjemplo';

const ESTADO_COLOR = { PENDIENTE: 'warning', APROBADA: 'success', RECHAZADA: 'default' };

const formInicial = { registroCodigo: '', cantidad: '', motivo: '', evidenciaUrl: null, evidenciaNombre: '' };

export default function MermasPage() {
  const { usuario } = useAuth();
  const puedeAprobar = usuario?.rol === ROLES.ADMIN;

  const [mermas, setMermas] = useState(mermasEjemplo);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [form, setForm] = useState(formInicial);

  const manejarArchivo = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setForm((prev) => ({ ...prev, evidenciaUrl: URL.createObjectURL(archivo), evidenciaNombre: archivo.name }));
  };

  const manejarCrear = () => {
    const nueva = {
      id: Date.now(),
      codigo: `MER-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-DEMO`,
      registroCodigo: form.registroCodigo,
      descripcionRegistro: '(pendiente de vincular con el registro real)',
      cantidad: Number(form.cantidad) || 0,
      motivo: form.motivo,
      reportadoPor: usuario?.nombre || 'Usuario',
      fecha: new Date().toISOString().slice(0, 10),
      estado: 'PENDIENTE',
      evidenciaUrl: form.evidenciaUrl,
    };
    setMermas((prev) => [nueva, ...prev]);
    setForm(formInicial);
    setDialogAbierto(false);
  };

  const cambiarEstado = (id, estado) => {
    setMermas((prev) => prev.map((m) => (m.id === id ? { ...m, estado } : m)));
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h5">Control de Mermas</Typography>
          <DatosEjemploChip />
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogAbierto(true)}>
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
                  <Avatar variant="rounded" src={m.evidenciaUrl || undefined} sx={{ bgcolor: 'grey.200' }}>
                    <PhotoCameraIcon fontSize="small" color="disabled" />
                  </Avatar>
                </TableCell>
                <TableCell>{m.codigo}</TableCell>
                <TableCell>
                  {m.registroCodigo}
                  <Typography variant="caption" display="block" color="text.secondary">
                    {m.descripcionRegistro}
                  </Typography>
                </TableCell>
                <TableCell align="right">{m.cantidad}</TableCell>
                <TableCell>{m.motivo}</TableCell>
                <TableCell>{m.reportadoPor}</TableCell>
                <TableCell>{m.fecha}</TableCell>
                <TableCell>
                  <Chip size="small" label={m.estado} color={ESTADO_COLOR[m.estado]} />
                </TableCell>
                {puedeAprobar && (
                  <TableCell align="right">
                    {m.estado === 'PENDIENTE' && (
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Aprobar">
                          <IconButton size="small" color="success" onClick={() => cambiarEstado(m.id, 'APROBADA')}>
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rechazar">
                          <IconButton size="small" color="error" onClick={() => cambiarEstado(m.id, 'RECHAZADA')}>
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogAbierto} onClose={() => setDialogAbierto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reportar Merma</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Código del registro afectado"
              placeholder="REG-20260915-ABCDE"
              value={form.registroCodigo}
              onChange={(e) => setForm({ ...form, registroCodigo: e.target.value })}
            />
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
              almacenamiento todavía.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAbierto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={manejarCrear} disabled={!form.registroCodigo || !form.motivo}>
            Enviar reporte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
