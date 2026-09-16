import { useState } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import { ROLES, ROLE_LABELS, useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState(ROLES.ADMIN);
  const [error, setError] = useState('');

  const destino = location.state?.from?.pathname || '/dashboard';

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!usuario.trim() || !password.trim()) {
      setError('Ingresa usuario y contraseña');
      return;
    }
    setError('');
    iniciarSesion({ nombre: usuario.trim(), rol });
    navigate(destino, { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        px: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }} elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'common.white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <InventoryIcon fontSize="large" />
            </Box>
            <Typography variant="h6" fontWeight={700} textAlign="center">
              Sistema de Gestión de Bodega
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Ingresa con tu cuenta para continuar
            </Typography>
          </Stack>

          <Box component="form" onSubmit={manejarSubmit}>
            <Stack spacing={2}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Usuario o email"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoFocus
                fullWidth
              />
              <TextField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              <TextField select label="Rol" value={rol} onChange={(e) => setRol(e.target.value)} fullWidth>
                {Object.values(ROLES).map((r) => (
                  <MenuItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </MenuItem>
                ))}
              </TextField>

              <Button type="submit" variant="contained" size="large" fullWidth>
                Iniciar sesión
              </Button>
            </Stack>
          </Box>

          <Alert severity="info" variant="outlined" sx={{ mt: 3 }}>
            Modo demostración: cualquier usuario/contraseña es válido. El rol elegido determina qué
            secciones ves (RBAC de prototipo, sin backend de autenticación real aún).
          </Alert>

          <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
            <Link component={RouterLink} to="/portal">
              Ir al portal público de consultas →
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
