import axios from "axios";
import { SESSION_EXPIRED_EVENT } from "../utils/session";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/";

const api = axios.create({ baseURL: API_URL });

// Si hay token guardado en localStorage, lo añade en los headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Renovación del token ----
// Mientras hay un refresh en curso, guardamos su promesa aquí. Cualquier otra petición
// que también reciba un 401 espera ESA misma promesa en vez de lanzar otro refresh.
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return Promise.reject(new Error("No hay refresh token"));

    // Se usa axios "pelado" (no `api`) para que esta petición no pase por los
    // interceptores y no pueda entrar en un bucle infinito
    refreshPromise = axios
      .post(`${API_URL}token/refresh/`, { refresh })
      .then((res) => {
        localStorage.setItem("access", res.data.access);
        if (res.data.refresh) localStorage.setItem("refresh", res.data.refresh);
        return res.data.access;
      })
      .finally(() => {
        refreshPromise = null; // listo para el siguiente ciclo
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = original?.url?.includes("token/");

    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true; // cada petición se reintenta como máximo una vez
      try {
        const access = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch (refreshError) {
        console.error("No se pudo renovar la sesión", refreshError);
        // No tocamos la URL: avisamos al AuthContext, que limpia y redirige sin recargar
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;