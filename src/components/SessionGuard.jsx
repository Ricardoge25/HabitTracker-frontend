import { useCallback } from "react";
import { Clock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useIdleSession } from "../hooks/useIdleSession";
import Modal from "./Modal";

/**
 * Envuelve las rutas privadas: vigila la inactividad y muestra el aviso previo.
 * No altera el contenido: renderiza `children` tal cual.
 */
export default function SessionGuard({ children }) {
  const { logout } = useAuth();

  const handleTimeout = useCallback(() => logout("idle"), [logout]);
  const { secondsLeft, stayActive } = useIdleSession({ onTimeout: handleTimeout });

  return (
    <>
      {children}

      {secondsLeft !== null && (
        // Cualquier forma de cerrar el diálogo (X, Escape, clic fuera) equivale a "sigo aquí"
        <Modal
          title="¿Sigues ahí?"
          onClose={stayActive}
          maxWidth="max-w-md"
          footer={
            <>
              <button type="button" onClick={() => logout()} className="btn btn-secondary">
                Cerrar sesión
              </button>
              <button type="button" autoFocus onClick={stayActive} className="btn btn-primary">
                Seguir conectado
              </button>
            </>
          }
        >
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10 text-amber-300">
              <Clock size={20} />
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">
              Por seguridad, cerraremos tu sesión por inactividad en{" "}
              <strong className="text-ink">{secondsLeft} s</strong>.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}