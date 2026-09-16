import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PortalPublicoPage from './pages/PortalPublicoPage';
import DashboardPage from './pages/DashboardPage';
import RegistrosPage from './pages/RegistrosPage';
import TrabajadoresPage from './pages/TrabajadoresPage';
import AsignacionesPage from './pages/AsignacionesPage';
import MermasPage from './pages/MermasPage';
import ReportesPage from './pages/ReportesPage';
import UsuariosPage from './pages/UsuariosPage';
import { ROLES, RequireAuth } from './auth/AuthContext';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/portal" element={<PortalPublicoPage />} />

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/registros" element={<RegistrosPage />} />
        <Route path="/trabajadores" element={<TrabajadoresPage />} />
        <Route path="/asignaciones" element={<AsignacionesPage />} />
        <Route path="/mermas" element={<MermasPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route
          path="/usuarios"
          element={
            <RequireAuth rolesPermitidos={[ROLES.ADMIN]}>
              <UsuariosPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
