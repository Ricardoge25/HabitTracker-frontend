import { useCallback, useMemo, useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./auth-context";

// Lee la sesión guardada. Es síncrono, así que el primer render ya conoce al usuario
// y ProtectRoute no redirige al login por error al recargar la página.
function readStoredUser() {
  try {
    const token = localStorage.getItem("access");
    const username = localStorage.getItem("username");
    return token && username ? { username, token } : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(async (username, password) => {
    try {
      const res = await api.post("/token/", { username, password });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", username);

      setUser({ username, token: res.data.access });
      return true;
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) throw new Error("Credenciales inválidas");
      if (status === 400) throw new Error("Ingrese usuario y contraseña, por favor");
      throw new Error("No se pudo conectar con el servidor. Intenta de nuevo.");
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    setUser(null);
  }, []);

  // Sin useMemo el objeto cambia en cada render y re-renderiza a todos los consumidores
  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}