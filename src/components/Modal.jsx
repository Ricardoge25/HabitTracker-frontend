import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

/**
 * Modal reutilizable: un solo overlay (recibe el clic de "fuera"), panel con
 * cabecera + cuerpo con scroll + pie opcional.
 * Mobile first: hoja inferior en móvil, diálogo centrado desde `sm`.
 */
export default function Modal({
  title,
  description,
  onClose,
  children,
  footer,
  maxWidth = "max-w-lg",
  closeOnEsc = true,
}) {
  const titleId = useId();

  // Guardamos el último onClose en una ref para no re-registrar listeners en cada render
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!closeOnEsc) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeOnEsc]);

  // Bloquear el scroll de la página mientras el modal está abierto
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-canvas/80 backdrop-blur-sm sm:items-center sm:p-4"
      // onMouseDown (no onClick): seleccionar texto dentro y soltar fuera no cierra el modal
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`card card-glow animate-modal-in flex max-h-[92dvh] w-full ${maxWidth} flex-col rounded-b-none sm:max-h-[90vh] sm:rounded-b-2xl`}
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ink sm:text-xl">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {/* Pie: botones apilados a ancho completo en móvil, en fila desde sm */}
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6 [&>button]:w-full sm:[&>button]:w-auto">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}