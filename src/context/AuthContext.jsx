import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { endSession } from "../api/auth";
import { AuthContext } from "./auth-context";
import {
  IDLE_TIMEOUT_MS,
  SESSION_EXPIRED_EVENT,
  getLastActivity,
  touchActivity,
} from "../utils/session";

// Función PURA (no modifica nada): decide con qué sesión arrancar.
// Si la última actividad fue hace más del límite, NO hay usuario y el motivo es "idle".
// Esto cubre "cerré el navegador y volví horas después", sin parpadeo del dashboard.
function readInitialSession() {
  try {
    const token = localStorage.getItem("access");
    const username = localStorage.getItem("username");
    if (!token || !username) return { user: null, reason: null };

    const last = getLastActivity();
    if (last !== null && Date.now() - last >= IDLE_TIMEOUT_MS) {
      return { user: null, reason: "idle" };
    }
    return { user: { username, token }, reason: null };
  } catch {
    return { user: null, reason: null };
  }
}

export function AuthProvider({ children }) {
  // useState con función: se calcula UNA vez al montar
  const [initial] = useState(readInitialSession);
  const [user, setUser] = useState(initial.user);
  // Por qué se cerró la sesión: null | "idle" | "expired". Lo lee el Login.
  const [logoutReason, setLogoutReason] = useState(initial.reason);

  // Si arrancamos con sesión caducada por inactividad, cerramos la sesión vieja:
  // se revoca su refresh en el servidor y se limpian los tokens.
  // Va en un efecto porque es un efecto secundario (red + almacenamiento) y
  // readInitialSession debe ser pura (React puede ejecutarla dos veces en StrictMode).
  // Si el efecto se ejecuta dos veces, la segunda ya no encuentra refresh y no hace nada.
  useEffect(() => {
    if (initial.reason === "idle") endSession();
  }, [initial.reason]);

  const login = useCallback(async (username, password) => {
    try {
      const res = await api.post("/token/", { username, password });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", username);
      touchActivity(); // iniciar sesión cuenta como actividad

      setLogoutReason(null);
      setUser({ username, token: res.data.access });
      return true;
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) throw new Error("Credenciales inválidas");
      if (status === 400) throw new Error("Ingrese usuario y contraseña, por favor.");
      throw new Error("No se pudo conectar con el servidor. Intenta de nuevo.");
    }
  }, []);

  // Único punto de cierre de sesión: manual (botón), inactividad (SessionGuard,
  // "idle") y sesión expirada (evento de axios, "expired") pasan todos por aquí.
  // endSession() revoca el refresh en el servidor SIN esperar la respuesta y
  // limpia el almacenamiento al instante: el cierre nunca se bloquea por la red.
  // reason es opcional. El typeof protege un caso real: Dashboard hace
  // <button onClick={logout}>, y React le pasaría el EVENTO de clic como primer argumento.
  const logout = useCallback((reason) => {
    endSession();
    setLogoutReason(typeof reason === "string" ? reason : null);
    setUser(null);
  }, []);

  // Escucha dos fuentes externas:
  //  1. axios: no pudo renovar el token -> sesión expirada.
  //  2. otras pestañas: el evento "storage" solo se dispara en las DEMÁS pestañas
  //     cuando alguien cambia localStorage. Así, cerrar sesión en una pestaña
  //     cierra todas, e iniciar sesión en una la refleja en las otras.
  //     (No hace falta revocar aquí: la pestaña que cerró sesión ya lo hizo.)
  useEffect(() => {
    const onExpired = () => logout("expired");

    const onStorage = (e) => {
      // e.key === null significa que alguien ejecutó localStorage.clear()
      if (e.key === null || e.key === "access") {
        setUser(readInitialSession().user);
      }
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
      window.removeEventListener("storage", onStorage);
    };
  }, [logout]);

  const value = useMemo(
    () => ({ user, login, logout, logoutReason }),
    [user, login, logout, logoutReason]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}