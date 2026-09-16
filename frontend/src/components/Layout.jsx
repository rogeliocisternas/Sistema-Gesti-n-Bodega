import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PublicIcon from '@mui/icons-material/Public';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ROLES, ROLE_LABELS, useAuth } from '../auth/AuthContext';

const DRAWER_WIDTH = 248;

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Registros de Entrada', path: '/registros', icon: <Inventory2Icon /> },
  { label: 'Trabajadores', path: '/trabajadores', icon: <PeopleIcon /> },
  { label: 'Asignaciones', path: '/asignaciones', icon: <AssignmentIcon /> },
  { label: 'Mermas', path: '/mermas', icon: <WarningAmberIcon /> },
  { label: 'Reportes', path: '/reportes', icon: <BarChartIcon /> },
  { label: 'Usuarios', path: '/usuarios', icon: <AdminPanelSettingsIcon />, rolesPermitidos: [ROLES.ADMIN] },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();

  const itemsVisibles = NAV_ITEMS.filter((item) => !item.rolesPermitidos || item.rolesPermitidos.includes(usuario?.rol));

  const manejarLogout = () => {
    cerrarSesion();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar
        position="fixed"
        color="primary"
        elevation={0}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, width: `calc(100% - ${DRAWER_WIDTH}px)`, ml: `${DRAWER_WIDTH}px` }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap>
            {NAV_ITEMS.find((i) => i.path === location.pathname)?.label || 'Sistema de Gestión de Bodega'}
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title="Abrir portal público en esta pestaña">
              <IconButton color="inherit" onClick={() => navigate('/portal')}>
                <PublicIcon />
              </IconButton>
            </Tooltip>
            <Chip
              size="small"
              label={ROLE_LABELS[usuario?.rol] || usuario?.rol}
              color={usuario?.rol === ROLES.ADMIN ? 'secondary' : 'default'}
              sx={{ color: 'common.white', borderColor: 'common.white' }}
              variant="outlined"
            />
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {(usuario?.nombre || '?').charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
              {usuario?.nombre}
            </Typography>
            <Tooltip title="Cerrar sesión">
              <IconButton color="inherit" onClick={manejarLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar>
          <Stack direction="row" spacing={1} alignItems="center">
            <InventoryIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              Gestión de Bodega
            </Typography>
          </Stack>
        </Toolbar>
        <Divider />
        <List sx={{ pt: 1 }}>
          {itemsVisibles.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{ mx: 1, borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, width: `calc(100% - ${DRAWER_WIDTH}px)` }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
