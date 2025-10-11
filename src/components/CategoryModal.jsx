import { useState } from "react";
import { X } from "lucide-react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

export default function CategoryModal({ isOpen, onClose, onSave }) {

  const [categoryData, setCategoryData] = useState({
    name: "",
    color: "#4951E4",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData({ ...categoryData, [name]: value });
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!categoryData.name.trim()) {
      toast.error("El nombre de la categoría es obligatorio");
      return;
    }

    try {
      const response = await api.post("/categories/", {
        ...categoryData,
      });

      if (response.status === 201) {
        toast.success("🎨 Categoría creada correctamente");
        setCategoryData({ name: "", color: "#0003A3" });
        onSave(); // recarga categorías en HabitModal
      }
    } catch (err) {
      console.error("Error creando categoría", err);
      toast.error("❌ Error al crear la categoría");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-2xl w-[90%] max-w-md relative shadow-2xl border border-gray-700">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={22} />
        </button>

        {/* Título */}
        <h2 className="text-xl font-semibold text-white mb-4">
          Nueva Categoría
        </h2>

        {/* Formulario */}
        <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
          <div>
            <label className="block text-base font-semibold ml-1 mb-1 text-gray-100">
              Nombre de la categoría
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ej: Salud, Trabajo, Lectura..."
              value={categoryData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-base font-semibold ml-1 mb-1 text-gray-100">
              Color de la categoría
            </label>
            <input
              type="color"
              name="color"
              className="w-full h-10 p-1 rounded-sm bg-gray-800 cursor-pointer"
              value={categoryData.color}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2.5 rounded-lg font-medium transition-all"
          >
            Crear Categoría
          </button>
        </form>
      </div>
    </div>
  );
}
