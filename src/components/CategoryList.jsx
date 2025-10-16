import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function CategoryList({ categories, fetchCategories, onEdit }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;

    try {
      setLoading(true);
      await api.delete(`/categories/${id}/`);
      toast.success("🗑️ Categoría eliminada");
      fetchCategories();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      toast.error("❌ No se pudo eliminar la categoría");
    } finally {
      setLoading(false);
    }
  };

  if (!categories?.length) {
    return (
      <div className="text-center text-gray-400 mt-10">
        <p>No tienes categorías aún.</p>
        <p className="text-sm mt-1">Crea una nueva para comenzar ✨</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="bg-black border-2 hover:border-indigo-600 rounded-xl px-5 py-4 flex justify-between items-center transition"
        >
          <div className="flex items-center gap-6 p-2">
            <span
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: cat.color || "#4951E4" }}
            ></span>
            <div>
              <h3 className="text-xl font-semibold">{cat.name}</h3>
              <p className="text-base text-gray-300">
                {cat.habit_count} {cat.habit_count === 1 ? "hábito" : "hábitos"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onEdit(cat)}
              className="text-gray-400 hover:text-indigo-600 transition"
              title="Editar"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => handleDelete(cat.id)}
              disabled={loading}
              className="text-gray-400 hover:text-red-400 transition"
              title="Eliminar"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}