import { createContext, useContext, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);
const STORAGE_KEY = 'bodega_auth_demo';

export const ROLES = {
  ADMIN: 'ADMIN',
  OPERADOR: 'OPERADOR',
};

export const ROLE_LABELS = {
  ADMIN: 'Administrador',
  OPERADOR: 'Operador',
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
      iniciarSesion: ({ nombre, rol }) => {
        const token = `demo.${btoa(unescape(encodeURIComponent(`${nombre}:${rol}:${Date.now()}`)))}.mock`;
        const sesion = { nombre, rol, token };
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

export function RequireAuth({ children, rolesPermitidos }) {
  const { usuario } = useAuth();
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
