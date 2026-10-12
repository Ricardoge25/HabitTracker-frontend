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

  // useCallback: identidad estable para la prop del hook
  const handleTimeout = useCallback(() => logout("idle"), [logout]);
  const { secondsLeft, stayActive } = useIdleSession({ onTimeout: handleTimeout });

  return (
    <>
      {children}

      {secondsLeft !== null && (
        // Cualquier forma de cerrar el diálogo (X, Escape, clic fuera) equivale a "sigo aquí"
        <Modal title="¿Sigues ahí?" onClose={stayActive} maxWidth="max-w-md"
          footer={
            <>
              <button
                type="button"
                onClick={() => logout()}
                className="cursor-pointer rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Cerrar sesión
              </button>
              <button
                type="button"
                autoFocus
                onClick={stayActive}
                className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Seguir conectado
              </button>
            </>
          }
        >
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <Clock size={20} />
            </div>
            <p className="text-sm leading-relaxed text-gray-300">
              Por seguridad, cerraremos tu sesión por inactividad en{" "}
              <strong className="text-white">{secondsLeft} s</strong>.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}