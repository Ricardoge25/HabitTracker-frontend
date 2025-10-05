import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/", // URL de la API (Backend)
})

// Si hay token guardado en localStorage, lo añade en los headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token){
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para renovar el token si expira
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expira ERROR 401 y no hemos intentado renovar antes
    if (
      error.response && 
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("token/")
    ) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem("refresh");
        const res = await axios.post("http://localhost:8000/api/token/refresh/", {
          refresh,
        });

        localStorage.setItem("access", res.data.access);

        // Actualizar el header y reintentar request original
        originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
        return api(originalRequest);
      } catch (err) {
        console.error("Error refrescando el token", err);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login/" // Redirige al login
      }
    }

    return Promise.reject(error);
  }
);

export default api;