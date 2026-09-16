import { createContext, useContext, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);
const STORAGE_KEY = 'bodega_auth_demo';

export const ROLES = {
  ADMIN: 'ADMIN',
  OPERADOR: 'OPERADOR',
  TRABAJADOR: 'TRABAJADOR',
};

export const ROLE_LABELS = {
  ADMIN: 'Administrador',
  OPERADOR: 'Operador',
  TRABAJADOR: 'Trabajador',
};

function leerSesionGuardada() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

// Autenticación simulada (sin backend real de usuarios/JWT): sirve para prototipar
// el flujo de login y el control de acceso por rol (RBAC) en la interfaz.
// Cualquier usuario/contraseña es válido; el rol se elige en el propio formulario.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesionGuardada);

  const value = useMemo(
    () => ({
      usuario,
      // trabajadorId (opcional): vincula la sesión con una fila real de la tabla trabajadores,
      // para el rol Trabajador (autoservicio) — ver LoginPage y MisAsignacionesPage.
      iniciarSesion: ({ nombre, rol, trabajadorId = null }) => {
        const token = `demo.${btoa(unescape(encodeURIComponent(`${nombre}:${rol}:${Date.now()}`)))}.mock`;
        const sesion = { nombre, rol, trabajadorId, token };
        setUsuario(sesion);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
        } catch {
          // localStorage no disponible (modo privado, etc.): la sesión igual funciona en memoria.
        }
      },
      cerrarSesion: () => {
        setUsuario(null);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          // no-op
        }
      },
    }),
    [usuario]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

// Página de inicio por rol: Trabajador aterriza en su vista de autoservicio,
// el resto en el dashboard administrativo.
export function rutaInicioPara(rol) {
  return rol === ROLES.TRABAJADOR ? '/mis-asignaciones' : '/dashboard';
}

export function RequireAuth({ children, rolesPermitidos }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to={rutaInicioPara(usuario.rol)} replace />;
  }
  return children;
}
