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
          <button type="button" autoFocus onClick={handleClose} disabled={loading} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className="btn btn-danger">
            {loading ? "Eliminando…" : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-red-300">
          <AlertTriangle size={20} />
        </div>
        <div className="text-sm leading-relaxed text-ink-muted">{message}</div>
      </div>
    </Modal>
  );
}