import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-hot-toast";

export default function CategoryModal({ isOpen, onClose, onSave, category }) {
  const isEditing = Boolean(category);

  const [categoryData, setCategoryData] = useState({
    name: "",
    color: "#4951E4",
  });

  // Si hay categoría para editar -> lo carga en el formulario
  useEffect(() => {
    if (category) {
      setCategoryData({
        name: category.name || "",
        color: category.color || "#4951E4",
      });
    } else {
      setCategoryData({ name: "", color: "#4951E4" });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategoryData({ ...categoryData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if(!categoryData.name.trim()){
      toast.error("El nombre de la categoría es obligatorio");
      return;
    }

    // Enviamos los datos al componente Padre (Categories.jsx)
    onSave(categoryData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-black p-6 rounded-2xl w-[90%] max-w-md relative shadow-2xl border-2 border-gray-300">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-100 hover:text-white transition"
        >
          <X size={22} />
        </button>

        {/* Título */}
        <h2 className="text-3xl font-semibold text-white mb-8 text-center font-mono">
          {isEditing ? "Editar Categoría" : "Nueva Categoría"}
        </h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-base font-semibold ml-1 mb-1 text-gray-100">
              Nombre de la categoría
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-medium bg-gray-200 text-gray-900 focus:outline-none focus:ring-3 focus:ring-indigo-500 placeholder:text-gray-600"
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
              className="w-full h-10 p-1 rounded-sm bg-gray-900 cursor-pointer"
              value={categoryData.color}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-indigo-600 hover:bg-indigo-800 text-white py-2.5 rounded-lg font-medium transition-all"
          >
            {isEditing ? "Guardar Cambios" : "Crear Categoría"}
          </button>
        </form>
      </div>
    </div>
  );
}
