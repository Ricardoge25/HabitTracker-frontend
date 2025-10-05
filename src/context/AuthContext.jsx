import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

// Creamos el contexto
export const AuthContext = createContext();

// Provider que envolverá toda la app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Aquí guardamos la información de los usuarios 
  const [loading, setLoading] = useState(true);

  // Se recupera el token al iniciar la app
  useEffect(() => {
    const token = localStorage.getItem("access");
    const username = localStorage.getItem("username")
    if (token && username) {
      setUser({ username, token }); // Por ahora solo se guarda el token
    }
    setLoading(false);
  }, []);

  // Función del Login
  const login = async (username, password) => {
    try {
      const res = await api.post("/token/", { 
        username, password 
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", username);

      // Actualizamos estado global
      setUser({ username, token: res.data.access });

    return true; // 👈 Indicamos que el login fue exitoso
    } catch (err) {
      if (err.response?.status === 401) {
        throw new Error ("Credenciales inválidas");
      }
      throw new Error("Ingrese usuario y contraseña, por favor.");
    }
  };

  // Función del Logout
  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth(){
  return useContext(AuthContext);
}

