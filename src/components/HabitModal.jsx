import { useState, useEffect } from "react";
import CategoryModal from "./CategoryModal";
import api from "../api/axios";
import { toast } from "react-hot-toast";

export default function HabitModal({ isOpen, onClose, onSave, habit, categories, fetchCategories }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [target, setTarget] = useState(habit?.target_per_period ?? 1);
  const [category, setCategory] = useState("");
  const [categoryData, setCategoryData] = useState({
    name: "",
    color: "#4951E4",
  });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Cargar datos si es edición
  useEffect(() => {
    if (habit) {
      setName(habit.name || "");
      setDescription(habit.description || "");
      setFrequency(habit.frequency || "daily");
      setTarget(habit.target_per_period || 1);
      setCategory(habit.category?.id || "");
    } else {
      setName("");
      setDescription("");
      setFrequency("daily");
      setTarget("");
      setCategory("");
    }
  }, [habit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name,
      description,
      frequency,
      target_per_period: Number(target),
      category_id: category ? Number(category) : null
    });
  };

  if (!isOpen) return null; // si no está abierto, no se renderiza nada

  return (
    <>
      {/* Fondo oscuro */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50" onClick={onClose}></div>

      {/* Contenedor del modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-black border-2 border-gray-400 rounded-2xl shadow-xl max-w-lg w-full p-5 sm:p-8 md:p-10 relative max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 sm:mb-6 md:mb-8 text-white text-center font-mono">
            {habit ? "Editar Hábito" : "Nuevo Hábito"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm sm:text-base font-semibold ml-1 mb-1 text-white">Nombre</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold ml-1 mb-1 text-white">Descripción</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold ml-1 mb-1 text-white">Frecuencia</label>
              <select
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm sm:text-base font-semibold ml-1 mb-1 text-white">Meta por Día</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                value={target || 1} 
                onChange={(e) => setTarget(e.target.value)}
                min="1"
              />
            </div>

            <div>
              <div className="flex justify-between items-center flex-wrap gap-1">
                <label className="block text-sm sm:text-base font-semibold ml-1 mb-1 text-white">
                  Categoría (opcional)
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="text-xs sm:text-sm text-indigo-300 hover:underline"
                >
                  + Nueva Categoría
                </button>
              </div>
              <select
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Sin Categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center gap-2 mt-4 sm:mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-400 text-sm sm:text-base font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-800 text-white text-sm sm:text-base font-semibold transition-colors"
              >
                {habit ? "Guardar cambios" : "Crear hábito"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de categorías */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={async (categoryData) => {
          try {
            const response = await api.post(
              "/categories/",
              categoryData,
            );

            toast.success("Categoría creada correctamente.")

            await fetchCategories(); // Recarga categorías desde el backend
            setCategory(response.data.id); // Selecciona automáticamente la nueva
            setIsCategoryModalOpen(false);

          } catch (error) {
            console.error("Error creando categoría", error);
            toast.error("No se pudo crear la categoría")
          }
        }}
        cate
      />
    </>
  );
}
