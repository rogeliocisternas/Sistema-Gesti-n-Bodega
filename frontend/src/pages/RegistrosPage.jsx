import { useEffect, useState } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EstadoChip from '../components/EstadoChip';
import { listarRegistros, crearRegistro, obtenerRegistroPorCodigo } from '../api/registros';

const TIPOS = ['MATERIAL', 'EQUIPO', 'DOCUMENTO', 'OTRO'];

const formInicial = { tipo_registro: 'MATERIAL', descripcion: '', cantidad: '', unidad_medida: 'UNIDAD' };

export default function RegistrosPage() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const cargarRegistros = async () => {
    setCargando(true);
    try {
      const data = await listarRegistros();
      setRegistros(data);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'No se pudieron cargar los registros' });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  const manejarCrear = async () => {
    try {
      await crearRegistro({ ...form, cantidad: Number(form.cantidad) });
      setDialogAbierto(false);
      setForm(formInicial);
      setMensaje({ tipo: 'success', texto: 'Registro creado correctamente' });
      cargarRegistros();
    } catch (err) {
      const texto = err.response?.data?.error || 'Error al crear el registro';
      setMensaje({ tipo: 'error', texto });
    }
  };

  const manejarBuscar = async () => {
    if (!busqueda.trim()) {
      cargarRegistros();
      return;
    }
    try {
      const registro = await obtenerRegistroPorCodigo(busqueda.trim());
      setRegistros([registro]);
    } catch (err) {
      setRegistros([]);
      setMensaje({ tipo: 'error', texto: 'No se encontró un registro con ese código' });
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Registros de Entrada</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogAbierto(true)}>
          Nuevo Registro
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar por código único (ej: REG-20260915-ABCDE)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && manejarBuscar()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ cursor: 'pointer' }} onClick={manejarBuscar} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell>Unidad</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.codigo_unico}</TableCell>
                <TableCell>{r.tipo_registro}</TableCell>
                <TableCell>{r.descripcion}</TableCell>
                <TableCell align="right">{r.cantidad}</TableCell>
                <TableCell>{r.unidad_medida}</TableCell>
                <TableCell>
                  <EstadoChip estado={r.estado} />
                </TableCell>
              </TableRow>
            ))}
            {!cargando && registros.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Sin registros
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogAbierto} onClose={() => setDialogAbierto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nuevo Registro de Entrada</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="Tipo de registro"
              value={form.tipo_registro}
              onChange={(e) => setForm({ ...form, tipo_registro: e.target.value })}
            >
              {TIPOS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              multiline
              minRows={2}
            />
            <TextField
              label="Cantidad"
              type="number"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            />
            <TextField
              label="Unidad de medida"
              value={form.unidad_medida}
              onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAbierto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={manejarCrear} disabled={!form.descripcion || !form.cantidad}>
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
