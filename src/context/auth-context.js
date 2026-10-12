import { createContext } from "react";

// Solo el objetivo de contexto.
// El Provider vive en AuthContext.jsx y el hook en hooks/useAuth.js
export const AuthContext = createContext(null)