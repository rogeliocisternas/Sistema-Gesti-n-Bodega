import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import RegistrosPage from './pages/RegistrosPage';
import TrabajadoresPage from './pages/TrabajadoresPage';
import AsignacionesPage from './pages/AsignacionesPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/registros" replace />} />
        <Route path="/registros" element={<RegistrosPage />} />
        <Route path="/trabajadores" element={<TrabajadoresPage />} />
        <Route path="/asignaciones" element={<AsignacionesPage />} />
        <Route path="*" element={<Navigate to="/registros" replace />} />
      </Route>
    </Routes>
  );
}
