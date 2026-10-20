import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { extractApiError } from "../utils/apiErrors";
import AppHeader from "../components/AppHeader";
import CategoryList from "../components/CategoryList";
import CategoryModal from "../components/CategoryModal";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // useCallback: identidad estable para usarla en efectos y pasarla como prop
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      toast.error("❌ No se pudieron cargar las categorías");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  // Crear o editar. Devuelve la promesa (async) para que el modal espere.
  const handleSaveCategory = async (categoryData) => {
    const isEditing = Boolean(editingCategory);
    try {
      if (isEditing) {
        await api.put(`/categories/${editingCategory.id}/`, categoryData);
        toast.success("✅ Categoría actualizada correctamente");
      } else {
        await api.post("/categories/", categoryData);
        toast.success("🎯 Nueva categoría creada");
      }
      closeModal();
      await fetchCategories();
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      toast.error(
        error.response?.status === 400
          ? extractApiError(error.response.data)
          : "❌ Error al guardar la categoría"
      );
    }
  };

  return (
    <div className="min-h-dvh">
      <AppHeader />

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <Link
          to="/home"
          className="mb-5 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-ink-muted transition hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
        >
          <ArrowLeft size={16} />
          Volver al dashboard
        </Link>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Categorías</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {loaded
                ? `${categories.length} ${categories.length === 1 ? "categoría creada" : "categorías creadas"}. Organiza tus hábitos por temas.`
                : "Organiza tus hábitos por temas."}
            </p>
          </div>
          <button type="button" onClick={openCreate} className="btn btn-primary w-full sm:w-auto">
            <Plus size={18} />
            Nueva categoría
          </button>
        </div>

        {!loaded ? (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="card h-[74px] animate-pulse" />
            ))}
          </div>
        ) : (
          <CategoryList
            categories={categories}
            fetchCategories={fetchCategories}
            onEdit={openEdit}
            onCreate={openCreate}
          />
        )}
      </main>

      {showModal && (
        <CategoryModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={handleSaveCategory}
          category={editingCategory}
        />
      )}
    </div>
  );
}