import axios from "axios";
import { clearSessionStorage } from "../utils/session";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/";

// Tiempo máximo que esperamos al servidor al revocar. Corto a propósito:
// cerrar sesión NUNCA debe depender de la red.
export const REVOKE_TIMEOUT_MS = 5000;

// Revoca (blacklist) el refresh token en el servidor.
//
// Contrato:
//  - Sin refresh no hace ninguna petición.
//  - NUNCA rechaza: devuelve true si el servidor lo revocó y false en cualquier
//    otro caso (red caída, timeout, token ya revocado o caducado...).
//    Así se puede lanzar sin await y sin try/catch.
//  - Usa axios "pelado" (no la instancia `api`): si responde 401, el interceptor
//    no debe intentar renovar la sesión (evita un bucle logout -> refresh -> logout).
export async function revokeRefreshToken(refresh) {
  if (!refresh) return false;

  try {
    await axios.post(
      `${API_URL}token/blacklist/`,
      { refresh },
      { timeout: REVOKE_TIMEOUT_MS }
    );
    return true;
  } catch {
    return false;
  }
}

// Termina la sesión en este navegador y pide al servidor que revoque el refresh.
//
// El ORDEN importa:
//  1. Leer el refresh ANTES de limpiar (después ya no existiría).
//  2. Lanzar la revocación SIN await: la petición ya lleva el token,
//     así que podemos limpiar aunque el servidor tarde o no responda.
//  3. Limpiar el almacenamiento al instante.
// Si la red falla, el refresh sigue válido hasta que caduque (máx. 1 día):
// riesgo aceptado a cambio de que cerrar sesión nunca se bloquee.
export function endSession() {
  const refresh = localStorage.getItem("refresh");
  void revokeRefreshToken(refresh);
  clearSessionStorage();
}