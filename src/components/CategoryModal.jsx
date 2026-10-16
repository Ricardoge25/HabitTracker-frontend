import { useEffect, useId, useState } from "react";
import { toast } from "react-hot-toast";
import Modal from "./Modal";

const DEFAULT_COLOR = "#6366f1";

// Paleta pensada para el fondo oscuro. El selector libre queda como alternativa.
const PALETTE = [
  "#6366f1", // índigo
  "#8b5cf6", // violeta
  "#ec4899", // rosa
  "#ef4444", // rojo
  "#f97316", // naranja
  "#f59e0b", // ámbar
  "#22c55e", // verde
  "#14b8a6", // turquesa
  "#06b6d4", // cian
  "#3b82f6", // azul
];

/**
 * Modal para crear o editar una categoría.
 * Sin la prop `category` => modo "crear". `onSave` debe devolver una promesa
 * para que el botón muestre "Guardando…" mientras se espera la respuesta.
 */
export default function CategoryModal({ isOpen, onClose, onSave, category }) {
  const formId = useId();
  const isEditing = Boolean(category);

  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar la categoría al editar; limpiar al crear
  useEffect(() => {
    setName(category?.name || "");
    setColor(category?.color || DEFAULT_COLOR);
  }, [category, isOpen]);

  const handleClose = () => {
    if (!isSaving) onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    if (!name.trim()) {
      toast.error("El nombre de la categoría es obligatorio");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ name: name.trim(), color });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      title={isEditing ? "Editar categoría" : "Nueva categoría"}
      description="Agrupa tus hábitos con un nombre y un color."
      onClose={handleClose}
      maxWidth="max-w-md"
      footer={
        <>
          <button type="button" onClick={handleClose} disabled={isSaving} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" form={formId} disabled={isSaving} className="btn btn-primary">
            {isSaving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear categoría"}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor={`${formId}-name`} className="mb-1.5 block text-sm font-medium text-ink">
            Nombre
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            className="field"
            placeholder="Ej: Salud, Trabajo, Lectura…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            required
            autoFocus
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">Color</legend>

          <div className="flex flex-wrap items-center gap-2.5">
            {PALETTE.map((swatch) => {
              const selected = swatch.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={swatch}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`Color ${swatch}`}
                  onClick={() => setColor(swatch)}
                  className={`h-9 w-9 cursor-pointer rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                    selected ? "ring-2 ring-ink ring-offset-2 ring-offset-surface" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              );
            })}

            {/* Selector libre */}
            <label
              title="Elegir otro color"
              className="relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-line-strong text-lg text-ink-muted transition hover:border-accent-soft hover:text-ink"
            >
              +
              <input
                type="color"
                aria-label="Elegir otro color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
          </div>
        </fieldset>

        {/* Vista previa tal como se verá en las tarjetas de hábitos */}
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Vista previa</p>
          <span
            className="inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            style={{
              color,
              backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
              borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
            }}
          >
            {name.trim() || "Nombre de la categoría"}
          </span>
        </div>
      </form>
    </Modal>
  );
}