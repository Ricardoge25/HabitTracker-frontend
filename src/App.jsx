import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import { AuthProvider } from "./context/AuthContext"; // 👈 importa el contexto
import ProtectRoute from './components/ProtectRoute';
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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
      <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000, 
            style: {
              background: "#1f2937",
              color: "#fff"
            },
          }}
        />
    </>
    
  )
}

export default App;
