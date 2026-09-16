import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { listarTrabajadores, crearTrabajador } from '../api/trabajadores';

const formInicial = { rut: '', nombres: '', apellidos: '', cargo: '', departamento: '', email: '' };

export default function TrabajadoresPage() {
  const [trabajadores, setTrabajadores] = useState([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [mensaje, setMensaje] = useState(null);

  const cargarTrabajadores = async () => {
    try {
      const data = await listarTrabajadores();
      setTrabajadores(data);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'No se pudieron cargar los trabajadores' });
    }
  };

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const manejarCrear = async () => {
    try {
      await crearTrabajador(form);
      setDialogAbierto(false);
      setForm(formInicial);
      setMensaje({ tipo: 'success', texto: 'Trabajador registrado correctamente' });
      cargarTrabajadores();
    } catch (err) {
      const texto = err.response?.data?.error || 'Error al registrar el trabajador';
      setMensaje({ tipo: 'error', texto });
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Trabajadores</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogAbierto(true)}>
          Nuevo Trabajador
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>RUT</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trabajadores.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.rut}</TableCell>
                <TableCell>{t.nombres} {t.apellidos}</TableCell>
                <TableCell>{t.cargo || '—'}</TableCell>
                <TableCell>{t.departamento || '—'}</TableCell>
                <TableCell>{t.email || '—'}</TableCell>
                <TableCell>
                  <Chip size="small" label={t.activo ? 'ACTIVO' : 'INACTIVO'} color={t.activo ? 'success' : 'default'} />
                </TableCell>
              </TableRow>
            ))}
            {trabajadores.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Sin trabajadores registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogAbierto} onClose={() => setDialogAbierto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nuevo Trabajador</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="RUT (formato 12345678-9)"
              value={form.rut}
              onChange={(e) => setForm({ ...form, rut: e.target.value })}
            />
            <TextField
              label="Nombres"
              value={form.nombres}
              onChange={(e) => setForm({ ...form, nombres: e.target.value })}
            />
            <TextField
              label="Apellidos"
              value={form.apellidos}
              onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
            />
            <TextField
              label="Cargo"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
            />
            <TextField
              label="Departamento"
              value={form.departamento}
              onChange={(e) => setForm({ ...form, departamento: e.target.value })}
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAbierto(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={manejarCrear}
            disabled={!form.rut || !form.nombres || !form.apellidos}
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
