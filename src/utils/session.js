// Configuración y utilidades de sesión. Sin React: solo constantes y localStorage.

// Valores por defecto. Para probar sin esperar 5 minutos, define en .env.local:
//   VITE_IDLE_TIMEOUT_MS=90000
export const IDLE_TIMEOUT_MS =
  Number(import.meta.env.VITE_IDLE_TIMEOUT_MS) || 5 * 60 * 1000;

// Margen de aviso antes de cerrar. Nunca más de la mitad del timeout (así el aviso
// no aparece nada más iniciar sesión si pruebas con tiempos cortos).
export const WARNING_MS = Math.min(60 * 1000, IDLE_TIMEOUT_MS / 2);

// Evento que axios dispara cuando no pudo renovar el token
export const SESSION_EXPIRED_EVENT = "auth:session-expired";

const LAST_ACTIVITY_KEY = "lastActivity";

// Devuelve el timestamp de la última actividad, o null si no existe
export function getLastActivity() {
  const value = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
  return Number.isFinite(value) && value > 0 ? value : null;
}

// Marca "ahora" como momento de última actividad
export function touchActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

// Borra TODO lo que identifica la sesión
export function clearSessionStorage() {
  ["access", "refresh", "username", LAST_ACTIVITY_KEY].forEach((key) =>
    localStorage.removeItem(key)
  );
}