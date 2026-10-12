import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import SessionGuard from "./SessionGuard";

export default function ProtectRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // El guardia solo existe mientras hay sesión
  return <SessionGuard>{children}</SessionGuard>;
}