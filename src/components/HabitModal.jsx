import { useEffect, useId, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import CategoryModal from "./CategoryModal";
import Modal from "./Modal";

const fieldClass =
  "w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm sm:text-base text-gray-100 placeholder:text-gray-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500";
const labelClass = "mb-1.5 block text-sm font-medium text-gray-200";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return; // evita doble envío
    setIsSaving(true);
    try {
      await onSave({
        name,
        description,
        frequency,
        target_per_period: Math.max(1, Number(target) || 1),
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
      await fetchCategories(); // recarga desde el backend
      setCategory(response.data.id); // selecciona la nueva
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
            : "Define qué quieres construir y cuántas veces al día."
        }
        onClose={handleClose}
        // Mientras el modal de categorías está abierto, Escape solo debe cerrar ese
        closeOnEsc={!isCategoryModalOpen}
        footer={
          <>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="cursor-pointer rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            {/* El botón está fuera del <form> (en el pie), se asocia con el atributo form */}
            <button
              type="submit"
              form={formId}
              disabled={isSaving}
              className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:cursor-wait disabled:opacity-60"
            >
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
              className={fieldClass}
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
              Descripción <span className="font-normal text-gray-500">(opcional)</span>
            </label>
            <textarea
              id={`${formId}-desc`}
              className={`${fieldClass} resize-none`}
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
                className={fieldClass}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div>
              <label htmlFor={`${formId}-target`} className={labelClass}>
                Meta por día
              </label>
              <input
                id={`${formId}-target`}
                type="number"
                className={fieldClass}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                min="1"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor={`${formId}-cat`} className="text-sm font-medium text-gray-200">
                Categoría <span className="font-normal text-gray-500">(opcional)</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="cursor-pointer text-sm font-medium text-indigo-400 transition hover:text-indigo-300 hover:underline"
              >
                + Nueva categoría
              </button>
            </div>
            <select
              id={`${formId}-cat`}
              className={fieldClass}
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