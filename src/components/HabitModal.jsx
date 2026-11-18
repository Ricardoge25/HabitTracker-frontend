import { useEffect, useId, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { FREQUENCY_CONFIG, clampTarget, getFrequencyConfig } from "../utils/habitUtils";
import CategoryModal from "./CategoryModal";
import Modal from "./Modal";

const labelClass = "mb-1.5 block text-sm font-medium text-ink";
const optional = <span className="font-normal text-ink-faint">(opcional)</span>;

export default function HabitModal({
  isOpen,
  onClose,
  onSave,
  habit,
  categories = [],
  fetchCategories,
}) {
  const formId = useId();
  const isEditing = Boolean(habit);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [target, setTarget] = useState("1"); // string: permite borrar el campo mientras se escribe
  const [category, setCategory] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Etiqueta, tope y ayuda de la meta: todo sale de la frecuencia elegida
  const { targetLabel, targetHelp, maxTarget } = getFrequencyConfig(frequency);

  // Cargar datos si es edición; limpiar si es creación
  useEffect(() => {
    if (habit) {
      setName(habit.name || "");
      setDescription(habit.description || "");
      setFrequency(habit.frequency || "daily");
      setTarget(String(habit.target_per_period || 1));
      setCategory(habit.category?.id || "");
    } else {
      setName("");
      setDescription("");
      setFrequency("daily");
      setTarget("1");
      setCategory("");
    }
  }, [habit, isOpen]);

  const handleClose = () => {
    if (!isSaving) onClose();
  };

  // Al cambiar de frecuencia se ajusta la meta al tope de la nueva (ej. 7 diarias -> 5 semanales).
  // Si el campo está vacío se respeta: el usuario aún está escribiendo.
  const handleFrequencyChange = (e) => {
    const nextFrequency = e.target.value;
    setFrequency(nextFrequency);
    if (target !== "") setTarget(String(clampTarget(nextFrequency, target)));
  };

  // Al salir del campo se normaliza (vacío, 0 o pasado del tope)
  const handleTargetBlur = () => {
    setTarget(String(clampTarget(frequency, target)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return; // evita doble envío
    setIsSaving(true);
    try {
      await onSave({
        name,
        description,
        frequency,
        // El backend rechaza metas fuera de rango (400): nunca enviamos una
        target_per_period: clampTarget(frequency, target),
        category_id: category ? Number(category) : null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Crea una categoría desde este modal y la deja seleccionada
  const handleCreateCategory = async (categoryData) => {
    try {
      const response = await api.post("/categories/", categoryData);
      toast.success("Categoría creada correctamente.");
      await fetchCategories();
      setCategory(response.data.id);
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error("Error creando categoría", error);
      toast.error("No se pudo crear la categoría");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        title={isEditing ? "Editar hábito" : "Nuevo hábito"}
        description={
          isEditing
            ? "Actualiza los datos de tu hábito."
            : "Define qué quieres construir y con qué frecuencia."
        }
        onClose={handleClose}
        // Mientras el modal de categorías está abierto, Escape solo debe cerrar ese
        closeOnEsc={!isCategoryModalOpen}
        footer={
          <>
            <button type="button" onClick={handleClose} disabled={isSaving} className="btn btn-secondary">
              Cancelar
            </button>
            {/* El botón está fuera del <form> (en el pie), se asocia con el atributo form */}
            <button type="submit" form={formId} disabled={isSaving} className="btn btn-primary">
              {isSaving ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear hábito"}
            </button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor={`${formId}-name`} className={labelClass}>
              Nombre
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              className="field"
              placeholder="Ej: Leer 30 minutos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={150}
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor={`${formId}-desc`} className={labelClass}>
              Descripción {optional}
            </label>
            <textarea
              id={`${formId}-desc`}
              className="field resize-none"
              placeholder="¿Por qué es importante para ti?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor={`${formId}-freq`} className={labelClass}>
                Frecuencia
              </label>
              <select
                id={`${formId}-freq`}
                className="field"
                value={frequency}
                onChange={handleFrequencyChange}
              >
                {/* Las opciones salen de FREQUENCY_CONFIG: una sola fuente de verdad */}
                {Object.entries(FREQUENCY_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${formId}-target`} className={labelClass}>
                {targetLabel}
              </label>
              <input
                id={`${formId}-target`}
                type="number"
                inputMode="numeric"
                className="field"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                onBlur={handleTargetBlur}
                min="1"
                max={maxTarget ?? undefined}
                aria-describedby={`${formId}-target-help`}
              />
            </div>
          </div>

          <p id={`${formId}-target-help`} className="-mt-2 text-sm text-ink-muted">
            {targetHelp}
          </p>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor={`${formId}-cat`} className="text-sm font-medium text-ink">
                Categoría {optional}
              </label>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="cursor-pointer text-sm font-medium text-accent-soft transition hover:underline"
              >
                + Nueva categoría
              </button>
            </div>
            <select
              id={`${formId}-cat`}
              className="field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal de categorías: sin prop `category` => modo "crear" */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleCreateCategory}
      />
    </>
  );
}