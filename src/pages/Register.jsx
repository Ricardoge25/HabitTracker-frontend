import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Check, Circle, Loader2, Mail, User } from "lucide-react";
import api from "../api/axios";
import { extractApiError } from "../utils/apiErrors";
import AuthLayout from "../components/AuthLayout";
import PasswordInput from "../components/PasswordInput";

// Mismas reglas que el backend. OJO: esto es solo ayuda visual (UX);
// la validación de verdad la hace el servidor.
const MIN_PASSWORD = 8;

// Icono y color de un requisito de contraseña según se cumpla o no
function Requirement({ met, children }) {
  return (
    <li className={`flex items-center gap-2 text-xs ${met ? "text-success" : "text-ink-muted"}`}>
      {met ? <Check size={14} /> : <Circle size={14} />}
      {children}
    </li>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-red-300">
      {message}
    </p>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (name) => (e) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
    // Al corregir un campo, su error desaparece
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Requisitos visibles de la contraseña
  const longEnough = formData.password.length >= MIN_PASSWORD;
  const notOnlyDigits = formData.password.length > 0 && !/^\d+$/.test(formData.password);
  const passwordsMatch = confirmPassword.length > 0 && formData.password === confirmPassword;

  // Valida en el cliente y devuelve un objeto { campo: mensaje }
  const validate = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = "El nombre de usuario es obligatorio.";
    if (!longEnough) errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
    if (formData.password !== confirmPassword) errors.confirm = "Las contraseñas no coinciden.";
    return errors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await api.post("/register/", {
        ...formData,
        username: formData.username.trim(),
        email: formData.email.trim(),
      });
      if (response.status === 201) {
        navigate("/login", { state: { registered: true } });
      }
    } catch (err) {
      console.error("Error en el registro:", err.response?.data || err.message);
      const data = err.response?.data;

      // DRF devuelve { campo: ["mensaje"] }: mostramos cada error junto a su campo.
      // Cualquier clave que no sea de un campo conocido va al mensaje general.
      if (err.response?.status === 400 && data && typeof data === "object") {
        const serverErrors = {};
        for (const key of ["username", "email", "password"]) {
          if (data[key]) serverErrors[key] = [].concat(data[key])[0];
        }
        if (Object.keys(serverErrors).length > 0) {
          setFieldErrors(serverErrors);
          return;
        }
      }
      setFormError(extractApiError(data, "Error al crear el usuario. Intenta de nuevo."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Completa el formulario para comenzar una nueva aventura."
      footer={
        <>
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="font-semibold text-accent-soft hover:underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleRegister} className="space-y-5" noValidate>
        {/* Usuario */}
        <div>
          <label htmlFor="reg-username" className="mb-1.5 block text-sm font-medium text-ink">
            Usuario
          </label>
          <div className="relative">
            <User
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              id="reg-username"
              type="text"
              autoComplete="username"
              autoFocus
              placeholder="Nombre de usuario"
              value={formData.username}
              onChange={setField("username")}
              aria-invalid={fieldErrors.username ? true : undefined}
              aria-describedby={fieldErrors.username ? "reg-username-error" : undefined}
              className={`field pl-10 ${fieldErrors.username ? "border-danger" : ""}`}
            />
          </div>
          <FieldError id="reg-username-error" message={fieldErrors.username} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-ink">
            Correo electrónico <span className="font-normal text-ink-faint">(opcional)</span>
          </label>
          <div className="relative">
            <Mail
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            />
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={formData.email}
              onChange={setField("email")}
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? "reg-email-error" : undefined}
              className={`field pl-10 ${fieldErrors.email ? "border-danger" : ""}`}
            />
          </div>
          <FieldError id="reg-email-error" message={fieldErrors.email} />
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-ink">
            Contraseña
          </label>
          <PasswordInput
            id="reg-password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChange={setField("password")}
            invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "reg-password-error" : undefined}
          />
          <FieldError id="reg-password-error" message={fieldErrors.password} />
          <ul className="mt-2.5 space-y-1" aria-label="Requisitos de la contraseña">
            <Requirement met={longEnough}>Al menos {MIN_PASSWORD} caracteres</Requirement>
            <Requirement met={notOnlyDigits}>No puede ser solo números</Requirement>
          </ul>
        </div>

        {/* Confirmar */}
        <div>
          <label htmlFor="reg-confirm" className="mb-1.5 block text-sm font-medium text-ink">
            Confirmar contraseña
          </label>
          <PasswordInput
            id="reg-confirm"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
            }}
            invalid={Boolean(fieldErrors.confirm)}
            aria-describedby={fieldErrors.confirm ? "reg-confirm-error" : undefined}
          />
          <FieldError id="reg-confirm-error" message={fieldErrors.confirm} />
          {passwordsMatch && !fieldErrors.confirm && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-success">
              <Check size={14} /> Las contraseñas coinciden
            </p>
          )}
        </div>

        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-red-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Creando cuenta…
            </>
          ) : (
            "Crear cuenta"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}