import { AppBar, Toolbar, Typography, Tabs, Tab, Container, Box } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';

const rutas = ['/registros', '/trabajadores', '/asignaciones'];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabActual = rutas.includes(location.pathname) ? location.pathname : '/registros';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <InventoryIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Sistema de Gestión de Bodega
          </Typography>
        </Toolbar>
        <Tabs
          value={tabActual}
          onChange={(_, valor) => navigate(valor)}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{ bgcolor: 'primary.dark' }}
        >
          <Tab label="Registros de Entrada" value="/registros" />
          <Tab label="Trabajadores" value="/trabajadores" />
          <Tab label="Asignaciones" value="/asignaciones" />
        </Tabs>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
