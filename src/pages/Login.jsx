import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const location = useLocation();

  // Mostrar notificación si el usuario acaba de registrarse
  useEffect(() => {
    if(location.state?.registered){
      toast.success("Registro exitoso. ¡Inicia sesión para continuar!");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const ok = await login(username, password);
      if (ok) {
        navigate("/home"); // Redirige al dashboard después del login
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      {/* Titulo principal */}
      <h1 className="text-4xl font-extrabold mb-2 font-mono">
        Habit <span className="text-indigo-600">Tracker</span>
      </h1>
      <p className="text-gray-400 mb-8">Construye mejores hábito, un día a la vez</p>

      {/* Caja de Login */}
      <div className="w-full max-w-md rounded-xl shadow-lg p-8 border-2 border-gray-300">
        <h2 className="text-3xl font-semibold mb-2">Iniciar Sesión</h2>
        <p className="text-sm text-gray-400 mb-6">
          Ingresa tus credenciales para acceder a tu cuenta.
        </p>
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-semibold ml-1 mb-1">Usuario</label>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-base font-semibold ml-1 mb-1">Contraseña</label>
            <input
              type="password"
              placeholder="*********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-800 text-white py-2 mt-2 rounded-lg font-semibold transition-colors"
          >
            Iniciar Sesión
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-500/2 p-2 rounded-md border border-red-700">
              {error}
            </p>
          )}
        </form>

        {/* Enlace para registrarse */}
        <p className="text-sm text-gray-400 mt-6 text-center">
          ¿No tienes una cuenta?{" "}
          <Link to={"/register"} className="text-indigo-400 hover:underline text-sm font-semibold">
            Regístrate aquí
          </Link>
        </p>
        
      </div>
    </div>
  );
}
