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
import MisAsignacionesPage from './pages/MisAsignacionesPage';
import { ROLES, RequireAuth, rutaInicioPara, useAuth } from './auth/AuthContext';

const ROLES_ADMINISTRATIVOS = [ROLES.ADMIN, ROLES.OPERADOR];

function InicioRedirect() {
  const { usuario } = useAuth();
  return <Navigate to={rutaInicioPara(usuario?.rol)} replace />;
}

function Protegida({ rolesPermitidos, children }) {
  return <RequireAuth rolesPermitidos={rolesPermitidos}>{children}</RequireAuth>;
}

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
        <Route path="/" element={<InicioRedirect />} />
        <Route
          path="/dashboard"
          element={
            <Protegida rolesPermitidos={ROLES_ADMINISTRATIVOS}>
              <DashboardPage />
            </Protegida>
          }
        />
        <Route
          path="/registros"
          element={
            <Protegida rolesPermitidos={ROLES_ADMINISTRATIVOS}>
              <RegistrosPage />
            </Protegida>
          }
        />
        <Route
          path="/trabajadores"
          element={
            <Protegida rolesPermitidos={ROLES_ADMINISTRATIVOS}>
              <TrabajadoresPage />
            </Protegida>
          }
        />
        <Route
          path="/asignaciones"
          element={
            <Protegida rolesPermitidos={ROLES_ADMINISTRATIVOS}>
              <AsignacionesPage />
            </Protegida>
          }
        />
        <Route
          path="/mermas"
          element={
            <Protegida rolesPermitidos={ROLES_ADMINISTRATIVOS}>
              <MermasPage />
            </Protegida>
          }
        />
        <Route
          path="/reportes"
          element={
            <Protegida rolesPermitidos={ROLES_ADMINISTRATIVOS}>
              <ReportesPage />
            </Protegida>
          }
        />
        <Route
          path="/usuarios"
          element={
            <Protegida rolesPermitidos={[ROLES.ADMIN]}>
              <UsuariosPage />
            </Protegida>
          }
        />
        <Route
          path="/mis-asignaciones"
          element={
            <Protegida rolesPermitidos={[ROLES.TRABAJADOR]}>
              <MisAsignacionesPage />
            </Protegida>
          }
        />
        <Route path="*" element={<InicioRedirect />} />
      </Route>
    </Routes>
  );
}
