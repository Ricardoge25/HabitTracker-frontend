import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Flame, MoreVertical, Plus, X } from "lucide-react";

export default function HabitList() {
  const [habits, setHabits] = useState([]);
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Estados para el formulario de nuevo hábito
  const [habitName, setHabitName] = useState("");
  const [habitDescription, setHabitDescription] = useState("");

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    // Lógica para crear un nuevo hábito (llamada a la API)
    try {
      const token = localStorage.getItem("token");
      const response = await api.post("/habits/", {
        name: habitName,
        description: habitDescription,
      });

      if (response.status === 201) {
        const newHabit = response.data;

        // Actualizamos la lista de hábitos
        setHabits((prev) => [...prev, newHabit]);

        // Limpiamos el formulario
        setHabitName("");
        setHabitDescription("");

        // Cerramos el modal
        setShowModal(false);
      } else {
        console.error("Error al crear el hábito", response.status);
      }
    } catch (error) {
      console.error("Error de red:", error);
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
          className="flex items-center gap-2 bg-white text-blue-600 font-medium hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl shadow transition-all"
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
                <button className="text-gray-400 hover:text-white">
                  <MoreVertical size={18} />
                </button>
              </div>
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
              Crear Nuevo Hábito
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
                Crear
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
