import { use, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Flame, MoreVertical, Plus, X, Trash2, Edit2 } from "lucide-react";

export default function HabitList() {
  const [habits, setHabits] = useState([]);
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null); // ID del hábito con un menú abierto
  const [editingHabit, setEditingHabit] = useState(null); // Hábito que se está editando

  // Estados para el formulario de nuevo hábito
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");

  // Crear nuevo hábito
  const handleCreateHabit = async (e) => {
    e.preventDefault();
    // Lógica para crear un nuevo hábito (llamada a la API)
  
    try {
      if (editingHabit) {
        // Modo Edición
        const response = await api.put(`/habits/${editingHabit.id}/`, {
          name: habitName,
          description: habitDescription,
        });

        if (response.status === 200) {
          setHabits((prev) => 
            prev.map((h) => (h.id === editingHabit.id ? response.data : h))
          );
        }
      } else {
        // Modo Creación
        const response = await api.post("/habits/", {
          name: habitName,
          description: habitDescription,
        });

        if (response.status === 201) {
          setHabits((prev) => [...prev, response.data]);
        }
      }

      // Limpiar estados
      setHabitName("");
      setHabitDescription("");
      setEditingHabit(null);
      setShowModal(false);
    } catch (err) {
      console.error("Error al crear/editar hábito", err);
    }
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setHabitName(habit.name);
    setHabitDescription(habit.description || "");
    setShowModal(true);
  }

  // Eliminar hábito
  const handleDeleteHabit = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este hábito?")) return;
    try {
      await api.delete (`/habits/${id}/`);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Error al eliminar hábito", err);
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

  return (
    <section className="w-full max-w-6xl">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Tus Hábitos</h2>
        <button
          onClick={() => setShowModal(true)}
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
              className="bg-gray-900 rounded-xl p-10 shadow-md hover:shadow-lg transition flex flex-col"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-cenrter gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-8 accent-green-700 bg-white rounded-4xl border-2 border-gray-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {habit.name}
                    </h3>
                    <p className="text-sm text-gray-400">
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
                    <MoreVertical size={20} />
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
              <div className="flex items-center gap-3 mt-4 text-sm text-gray-400">
                <span className="bg-blue-600/30 border border-blue-600 text-blue-400 px-2 py-1 text-xs rounded-full">
                  {habit.category || "General"}
                </span>
                <div className="flex items-center gap-1">
                  <Flame className="text-orange-500" size={16} />
                  <span>0 días</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para crear nuevo hábito */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-8 w-[95%] max-w-xl shadow-2xl relative">
            <h3 className="text-xl font-semibold text-white mb-6">
              {editingHabit ? "Editar Hábito" : "Nuevo Hábito"}
            </h3>

            <form onSubmit={handleCreateHabit} className="flex flex-col gap-3">
              <input
                type="text"
                className="p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-600"
                placeholder="Nombre del hábito"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                required
              />
              <textarea
                placeholder="Descripción (opcional)"
                className="p-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-600"
                rows={5}
                value={habitDescription}
                onChange={(e) => setHabitDescription(e.target.value)}
              ></textarea>

              <button
                type="submit"
                className="bg-blue-600 hover:blue-700 text-white py-2.5 rounded-lg font-medium transition-all"
              >
                {editingHabit ? "Gurdar cambios" : "Crear Hábito"}
              </button>
            </form>

            {/* Cerrar Modal */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-gray-600 hover:text-white text-lg"
            >
              <X size={28} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
