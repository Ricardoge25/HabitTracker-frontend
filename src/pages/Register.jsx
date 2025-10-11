import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (!formData.username.trim()) {
      setError("El nombre de usuario es obligatorio");
      return;
    }

    try {
      const response = await api.post("/register/", formData);

      if (response.status === 201) {
        navigate("/login", { state: { registered: true } }); // Redirige al login después del registro
      }
    } catch (err) {
      console.error("Error en el registro:", err.response?.data || err.message);
      setError(
        err.response?.data?.error ||
        "Error al crear el usuario. Intenta de nuevo."
      );
    }
  };

  return (
    <div className="md:h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4 pb-2">
      {/* Título Principal */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-2 font-mono mt-6">
        Habit <span className="text-indigo-600">Tracker</span>
      </h1>
      <p className="text-sm md:text-lg text-gray-400 mb-6 md:mb-8"> 
        Construye mejores hábitos, un día a la vez
      </p>

      {/* Caja de Registro */}
      <div className="bg-gray-900 p-6 md:p-8 rounded-xl shadow-lg border border-gray-700 w-full max-w-md mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2">Crear Cuenta</h2>
        <p className="text-sm md:text-base text-gray-400 mb-3 md:mb-6">
          Completa el formulario para comenzar una nueva aventura.
        </p>

        <form onSubmit={handleRegister} className="space-y-2 md:space-y-4">
          <div>
            <label className="block text-base font-semibold ml-1 mb-1">
              Usuario
            </label>
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-md font-semibold ml-1 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Correo electrónico (opcional)"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-md font-semibold ml-1 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-md font-semibold ml-1 mb-1">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center bg-red-500/2 p-2 rounded-md border border-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 mt-2 rounded-lg font-semibold transition-colors"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4 text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
