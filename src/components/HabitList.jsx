import { use, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Flame, MoreVertical, Plus, X, Trash2, Edit2 } from "lucide-react";
import { toast } from "react-hot-toast";
import HabitModal from "./HabitModal";

export default function HabitList() {
  const [habits, setHabits] = useState([]);
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null); // ID del hábito con un menú abierto
  const [editingHabit, setEditingHabit] = useState(null); // Hábito que se está editando
  /* const [isCompleted, setIsCompleted] = useState(habit.completed); */

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api.get("/categories/").then(res => setCategories(res.data));
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/",{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("❌ Error al obtener categorías:", error);
    }
  };

  // Crear nuevo hábito
  const handleCreateHabit = async (habitData) => {
    // Lógica para crear un nuevo hábito (llamada a la API)
    try {
      if (editingHabit) {
        // Modo Edición
        const response = await api.put(`/habits/${editingHabit.id}/`, habitData);

        if (response.status === 200) {
          setHabits((prev) => 
            prev.map((h) => (h.id === editingHabit.id ? response.data : h))
          );
          toast.success("✅ Hábito actualizado correctamente");
        }
      } else {
        // Modo Creación
        const response = await api.post("/habits/", habitData);

        if (response.status === 201) {
          setHabits((prev) => [...prev, response.data]);
          toast.success("🎯 Nuevo hábito creado");
        }
      }

      // Limpiar estados
      setEditingHabit(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error al crear/editar hábito", err);
      toast.error("❌ No se pudo crear/editar el hábito")
    }
  };

  const handleNewHabit = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  }

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
  };

  // Eliminar hábito
  const handleDeleteHabit = async (habitId) => {
    try {
      const res = await api.delete(`/habits/${habitId}/`);
      if (res.status === 204) {
        setHabits((prev) => prev.filter((h) => h.id !== habitId));
        toast.success("🗑️ Hábito eliminado correctamente");
      }
    } catch (err) {
      toast.error("❌ Error al eliminar el hábito");
    }
  };

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await api.get("/habits/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        setHabits(res.data);
      } catch (err) {
        console.error("❌ Error cargando hábitos", err);
      }
    };

    if (user) fetchHabits();
  }, [user]);

  /* const toggleHabit = () => {
    setIsCompleted(!isCompleted);
  } */

  return (
    <section className="w-full max-w-6xl">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Tus Hábitos</h2>
        <button
          onClick={handleNewHabit}
          className="flex items-center gap-2 bg-white text-blue-600 font-medium hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl shadow transition-all cursor-pointer"
        >
          <Plus size={16} />
          Nuevo Hábito
        </button>
      </div>

      {habits.length === 0 ? (
        <p className="text-gray-400">No tienes hábitos registrados todavía.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="bg-gray-900 rounded-xl p-6 md:p-8 shadow-md hover:shadow-lg transition flex flex-col"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-cenrter gap-3">
                  <input
                    type="checkbox"
                    //checked = {isCompleted}
                    //onChange={toggleHabit}
                    className="w-5 h-5 mt-2 appearance-none rounded-lg border-2 border-gray-400 bg-white checked:bg-green-500 checked:border-green-500 transition-all duration-200 cursor-pointer"
                  />
                  <div>
                    <h3 /* className={`text-lg md:text-2xl font-semibold duration-200 ${
                      isCompleted ? "line-through text-gray-400" : "text-white"
                      }`} */ 
                      className="text-lg md:text-2xl font-semibold duration-200 text-white"
                    >
                      {habit.name}
                    </h3>
                    <p className="text-sm md:text-base text-gray-400">
                      {habit.description || "Sin descripción"}
                    </p>
                  </div>
                </div>

                {/* Menú de opciones */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(openMenuId === habit.id ? null : habit.id)
                    }
                    className="text-gray-400 hover:text-white transition cursor-pointer"
                  >
                    <MoreVertical size={24} />
                  </button>

                  {openMenuId === habit.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-10">
                      <button
                        onClick={() => handleEditHabit(habit)}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-t-xl"
                      >
                        <Edit2 size={16} /> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-700 rounded-b-xl"
                      >
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Info del hábito */}
              <div className="flex items-center gap-3 mt-6 text-sm text-gray-400">
                <span 
                  className="border px-2 py-1 text-xs rounded-full font-bold"
                  style={{
                    borderColor: habit.category?.color || "#4951E4" ,
                    color: habit.category?.color || "#4951E4",
                    backgroundColor: `${habit.category?.color || "#4951E4"}30`,
                  }}
                >
                  {habit.category?.name || "Sin categoría"}
                </span>
                <div className="flex items-center gap-1">
                  <Flame className="text-orange-500" size={20} />
                  <span>0 días</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear nuevo hábito */}
      <HabitModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleCreateHabit}
        habit={editingHabit}
        categories={categories}
        fetchCategories={fetchCategories}
      />
    </section>
  );
}
