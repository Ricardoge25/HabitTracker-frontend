import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

/**
 * Diálogo de confirmación para acciones destructivas.
 * El foco inicial está en "Cancelar": pulsar Enter por accidente no borra nada.
 */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Eliminar",
  onConfirm,
  onCancel,
  loading = false,
}) {
  const handleClose = () => {
    if (!loading) onCancel();
  };

  return (
    <Modal
      title={title}
      onClose={handleClose}
      closeOnEsc={!loading}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            autoFocus
            onClick={handleClose}
            disabled={loading}
            className="cursor-pointer rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Eliminando..." : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <AlertTriangle size={20} />
        </div>
        <div className="text-sm leading-relaxed text-gray-300">{message}</div>
      </div>
    </Modal>
  );
}