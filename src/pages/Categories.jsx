import { useState, useEffect } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CategoryList from "../components/CategoryList";
import CategoryModal from "../components/CategoryModal";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const navigate = useNavigate();

  // GET Catogorías
  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      toast.error("❌ No se pudieron cargar las categorías");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // PUT y POST Categoría
  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        // Editar Categoría existente
        const response = await api.put(
          `/categories/${editingCategory.id}/`, 
          categoryData
        );
        if (response.status === 200) toast.success("✅ Categoría actualizado correctamente");
      } else {
        // Crear nueva categoría
        const response = await api.post("/categories/", categoryData);
        if (response.status === 201) toast.success("🎯 Nueva categoría creada");
      }
      
      // Cerrar modaly limpiar estado
      setShowModal(false);
      setEditingCategory(null);
      fetchCategories();

    } catch (error) {
      console.error("Error al guardar categoría:", error);
      if (error.response?.status === 400 && error.response.data?.name){
        toast.error(error.response.data.name);
      } else {
        toast.error("❌ Error al guardar la categoría");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-12 py-10">
      {/* Encabezado */}
      <div className="flex items-center gap-8 mb-16">
        <ArrowLeft
          size={32}
          className="cursor-pointer hover:bg-white rounded-lg transition hover:text-indigo-600 "
          onClick={() => navigate("/home")}
        />
        <div>
          <h1 className="text-3xl font-bold text-indigo-400">
            Gestión de Categorías
          </h1>
          <p className="text-sm text-gray-400">
            Organiza tus hábitos por categorías
          </p>
        </div>
      </div>

      {/* Encabezado de lista y botón */}
      <div className="flex justify-between items-center mb-6 ml-2">
        <div>
          <h2 className="text-3xl font-semibold mb-2">
            Tus Categorías
          </h2>
          <p className="text-sm text-gray-400">
            {categories.length} categoría{categories.length !== 1 && "s"} creadas
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-white text-indigo-600 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 hover:text-white transition"
        >
          <Plus size={18} />
          Nueva Categoría
        </button>
      </div>

      {/* Lista de Categorías */}
      <CategoryList 
        categories={categories} 
        fetchCategories={fetchCategories} 
        onEdit={(cat) => {
          setEditingCategory(cat);
          setShowModal(true);
        }}
      />

      {/* Modal de Crear/Editar */}
      {showModal && (
        <CategoryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCategory}
          category={editingCategory}
        />
      )}
    </div>
  );
}