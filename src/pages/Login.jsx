import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { AlertCircle, Clock, Loader2, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";

const SESSION_MESSAGES = {
  idle: "Tu sesión se cerró por inactividad. Inicia sesión de nuevo.",
  expired: "Tu sesión expiró. Inicia sesión de nuevo.",
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, logoutReason } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mostrar notificación si el usuario acaba de registrarse
  useEffect(() => {
    if (location.state?.register) {
      toast.success("Registro exitoso. ¡Inicia sesión para continuar!");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    try {
      const ok = await login(username.trim(), password);
      if (ok) navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Ingresa tus credenciales para acceder a tu cuenta."
      footer={
        <>
          ¿No tienes una cuenta?{" "}
          <Link to="/register" className="font-semibold text-accent-soft hover:underline">
            Regístrate aquí
          </Link>
        </>
      }
    >
      {/* Motivo por el que se cerró la sesión anterior */}
      {logoutReason && SESSION_MESSAGES[logoutReason] && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-amber-200"
        >
          <Clock size={18} className="mt-0.5 shrink-0" />
          <span>{SESSION_MESSAGES[logoutReason]}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="login-username" className="mb-1.5 block text-sm font-medium text-ink">
            Usuario
          </label>
          <div className="relative">
            <User 
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input 
              id="login-username"
              type="text"
              autoComplete="username"
              autoFocus
              placeholder="Tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="field pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-ink">
            Contraseña
          </label>
          <PasswordInput 
            id="login-password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-red-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Ingresando...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}