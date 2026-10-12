import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

/**
 * Modal reutilizable: un solo overlay (recibe el clic de "fuera"), panel con 
 * cabecera + cuerpo con scroll + pie opcional
 * Se monta solo cuando está abierto: quien lo usa decide con {open && <Modal/>}.
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

  // Cerrar con ESC
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      // onMouseDown (no onClick): seleccionar text dentro y soltar fuera no cierra el modal
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`animate-modal-in flex max-h-[90vh] w-full ${maxWidth} flex-col rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl`}
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-800 px-6 py-5">
          <div>
            <h2 id={titleId} className="text-xl font-semibold text-white">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 cursor-pointer rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="overflow-y-auto px-6 py-5">{children}</div>

        {/* Pie */}
        {footer && (
          <div className="flex justify-end gap-3 border-t border-gray-800 px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}