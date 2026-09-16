import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DatosEjemploChip from '../components/DatosEjemploChip';
import { ROLE_LABELS, ROLES } from '../auth/AuthContext';
import { usuariosEjemplo } from '../data/datosEjemplo';

const formInicial = { nombre: '', email: '', rol: ROLES.OPERADOR };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState(usuariosEjemplo);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [form, setForm] = useState(formInicial);

  const manejarCrear = () => {
    setUsuarios((prev) => [
      ...prev,
      { id: Date.now(), nombre: form.nombre, email: form.email, rol: form.rol, activo: true },
    ]);
    setForm(formInicial);
    setDialogAbierto(false);
  };

  const cambiarRol = (id, rol) => {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, rol } : u)));
  };

  const alternarActivo = (id) => {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)));
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Typography variant="h5">Gestión de Usuarios</Typography>
          <DatosEjemploChip />
        </Stack>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setDialogAbierto(true)}>
          Invitar Usuario
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Esta sección solo es visible para el rol Administrador (control de acceso por rol / RBAC).
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Activo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.nombre}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <TextField
                    select
                    size="small"
                    value={u.rol}
                    onChange={(e) => cambiarRol(u.id, e.target.value)}
                    sx={{ minWidth: 160 }}
                  >
                    {Object.values(ROLES).map((r) => (
                      <MenuItem key={r} value={r}>
                        <Chip
                          size="small"
                          label={ROLE_LABELS[r]}
                          color={r === ROLES.ADMIN ? 'primary' : 'default'}
                          sx={{ pointerEvents: 'none' }}
                        />
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <Switch checked={u.activo} onChange={() => alternarActivo(u.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogAbierto} onClose={() => setDialogAbierto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Invitar Usuario</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField select label="Rol" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
              {Object.values(ROLES).map((r) => (
                <MenuItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogAbierto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={manejarCrear} disabled={!form.nombre || !form.email}>
            Enviar invitación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
