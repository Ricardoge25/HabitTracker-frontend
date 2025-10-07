import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import { AuthProvider } from "./context/AuthContext"; // 👈 importa el contexto
import ProtectRoute from './components/ProtectRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas Protegidas */}
          <Route 
            path="/home" 
            element={
              <ProtectRoute>
                <Dashboard /> 
              </ProtectRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App;
