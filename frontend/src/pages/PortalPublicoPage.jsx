import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Link,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchIcon from '@mui/icons-material/Search';
import EstadoChip from '../components/EstadoChip';
import { obtenerRegistroPorCodigo } from '../api/registros';
import { obtenerTrabajadorPorRut } from '../api/trabajadores';
import { listarAsignacionesPorTrabajador } from '../api/asignaciones';

export default function PortalPublicoPage() {
  const [modo, setModo] = useState('codigo');

  const [codigo, setCodigo] = useState('');
  const [registro, setRegistro] = useState(null);
  const [errorRegistro, setErrorRegistro] = useState('');

  const [rut, setRut] = useState('');
  const [trabajador, setTrabajador] = useState(null);
  const [asignaciones, setAsignaciones] = useState([]);
  const [errorTrabajador, setErrorTrabajador] = useState('');

  const buscarPorCodigo = async () => {
    if (!codigo.trim()) return;
    setErrorRegistro('');
    setRegistro(null);
    try {
      const data = await obtenerRegistroPorCodigo(codigo.trim());
      setRegistro(data);
    } catch {
      setErrorRegistro('No se encontró un registro con ese código.');
    }
  };

  const buscarPorRut = async () => {
    if (!rut.trim()) return;
    setErrorTrabajador('');
    setTrabajador(null);
    setAsignaciones([]);
    try {
      const t = await obtenerTrabajadorPorRut(rut.trim());
      setTrabajador(t);
      const a = await listarAsignacionesPorTrabajador(t.id);
      setAsignaciones(a);
    } catch {
      setErrorTrabajador('No se encontró un trabajador con ese RUT.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <InventoryIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Portal Público de Consultas
          </Typography>
          <Link component={RouterLink} to="/login" color="inherit" underline="hover">
            Acceso funcionarios →
          </Link>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 5 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Consulta pública, sin necesidad de iniciar sesión: busca un registro por su código único
          o los movimientos de un trabajador por su RUT.
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs value={modo} onChange={(_, v) => setModo(v)} variant="fullWidth">
            <Tab label="Por código de registro" value="codigo" />
            <Tab label="Por RUT de trabajador" value="rut" />
          </Tabs>
        </Paper>

        {modo === 'codigo' && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="REG-20260915-ABCDE"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscarPorCodigo()}
              />
              <Button variant="contained" startIcon={<SearchIcon />} onClick={buscarPorCodigo}>
                Buscar
              </Button>
            </Stack>

            {errorRegistro && <Alert severity="warning">{errorRegistro}</Alert>}

            {registro && (
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {registro.codigo_unico}
                    </Typography>
                    <EstadoChip estado={registro.estado} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Tipo: {registro.tipo_registro}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {registro.descripcion}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Cantidad: {registro.cantidad} {registro.unidad_medida}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Stack>
        )}

        {modo === 'rut' && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="12345678-9"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscarPorRut()}
              />
              <Button variant="contained" startIcon={<SearchIcon />} onClick={buscarPorRut}>
                Buscar
              </Button>
            </Stack>

            {errorTrabajador && <Alert severity="warning">{errorTrabajador}</Alert>}

            {trabajador && (
              <>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {trabajador.nombres} {trabajador.apellidos}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      RUT: {trabajador.rut} {trabajador.cargo ? `· ${trabajador.cargo}` : ''}
                    </Typography>
                  </CardContent>
                </Card>

                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Registro</TableCell>
                        <TableCell>Fecha asignación</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {asignaciones.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            {a.registro?.codigo_unico} — {a.registro?.descripcion}
                          </TableCell>
                          <TableCell>{new Date(a.fecha_asignacion).toLocaleDateString('es-CL')}</TableCell>
                          <TableCell>
                            <EstadoChip estado={a.estado} />
                          </TableCell>
                        </TableRow>
                      ))}
                      {asignaciones.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            Sin movimientos registrados
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
