import { useState } from "react";
import { Edit2, FolderOpen, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import ConfirmDialog from "./ConfirmDialog";

export default function CategoryList({ categories, fetchCategories, onEdit, onCreate }) {
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/categories/${categoryToDelete.id}/`);
      toast.success("🗑️ Categoría eliminada");
      setCategoryToDelete(null);
      await fetchCategories();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      toast.error("❌ No se pudo eliminar la categoría");
    } finally {
      setIsDeleting(false);
    }
  };

  // Estado vacío con llamada a la acción
  if (!categories?.length) {
    return (
      <div className="card flex flex-col items-center px-6 py-12 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent-soft">
          <FolderOpen size={28} />
        </span>
        <h3 className="text-lg font-semibold text-ink">Aún no tienes categorías</h3>
        <p className="mt-1 max-w-xs text-sm text-ink-muted">
          Agrupa tus hábitos por temas como Salud, Trabajo o Lectura.
        </p>
        <button type="button" onClick={onCreate} className="btn btn-primary mt-6">
          Crear mi primera categoría
        </button>
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {categories.map((cat) => {
          const color = cat.color || "#6366f1";
          return (
            <li key={cat.id} className="card flex items-center gap-4 p-4">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
                  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 40%, transparent)`,
                }}
              >
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-ink">{cat.name}</h3>
                <p className="text-sm text-ink-muted">
                  {cat.habit_count} {cat.habit_count === 1 ? "hábito" : "hábitos"}
                </p>
              </div>

              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(cat)}
                  aria-label={`Editar ${cat.name}`}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-2 hover:text-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(cat)}
                  aria-label={`Eliminar ${cat.name}`}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition hover:bg-danger/10 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {categoryToDelete && (
        <ConfirmDialog
          title="¿Eliminar esta categoría?"
          message={
            <>
              Vas a eliminar <strong className="text-ink">{categoryToDelete.name}</strong>.
              {categoryToDelete.habit_count > 0 && (
                <>
                  {" "}
                  Sus {categoryToDelete.habit_count}{" "}
                  {categoryToDelete.habit_count === 1 ? "hábito" : "hábitos"} no se borrarán: se
                  quedarán sin categoría.
                </>
              )}{" "}
              Esta acción no se puede deshacer.
            </>
          }
          confirmLabel="Eliminar categoría"
          onConfirm={confirmDelete}
          onCancel={() => setCategoryToDelete(null)}
          loading={isDeleting}
        />
      )}
    </>
  );
}