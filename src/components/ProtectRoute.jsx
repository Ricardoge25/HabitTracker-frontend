import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Si no hay usuario, lo redirige al login
    return <Navigate to="/login" replace />;
  }

  return children; // Si hay usuario, renderiza la ruta normal.
  
}