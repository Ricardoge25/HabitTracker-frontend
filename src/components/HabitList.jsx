import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Flame, MoreVertical, Plus, Trash2, Edit2, Tags, Minus, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import HabitModal from "./HabitModal";
import { useNavigate } from "react-router-dom";

export default function HabitList({ onProgressChange, onStatsChange }) {
  const [habits, setHabits] = useState([]);
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null); // ID del hábito con un menú abierto
  const [editingHabit, setEditingHabit] = useState(null); // Hábito que se está editando
  const [justCompleted, setJustCompleted] = useState({}); // FEATURE: pulso/celebración al completar un hábito
  const navigate = useNavigate();

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
        const response = await api.patch(`/habits/${editingHabit.id}/`, habitData);

        if (response.status === 200) {
          setHabits((prev) => 
            prev.map((h) => (h.id === editingHabit.id ? response.data : h))
          );
          toast.success("Hábito actualizado correctamente");
        }
      } else {
        // Modo Creación
        const response = await api.post("/habits/", habitData);

        if (response.status === 201) {
          setHabits((prev) => [...prev, response.data]);
          toast.success("🎯 Nuevo hábito creado");
        }
      }

      await fetchHabits(); 

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

  const fetchHabits = async () => {
    try {
      const res = await api.get("/habits/today/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      const sortedHabits = res.data.sort((a, b) => a.completed_today - b.completed_today);
      setHabits(sortedHabits);

      if (onStatsChange) {
        const completed = sortedHabits.filter(h => h.completed_today).length;
        onStatsChange({ completed, total: sortedHabits.length });
      }
    } catch (err) {
      console.error("❌ Error cargando hábitos", err);
    }
  };

  useEffect(() => {
    if (user) fetchHabits();
  }, [user]);

  // FEATURE: activa la animación de "recién completado" por 600ms
  const triggerCompletionPulse = (habitId) => {
    setJustCompleted((prev) => ({ ...prev, [habitId]: true }));
    setTimeout(() => {
      setJustCompleted((prev) => ({ ...prev, [habitId]: false }));
    }, 3000);
  };

  const handleToggleCompletion = async (habit) => {
    if (pendingHabits[habit.id]) return; // ya hay una petición en curso, ignora el clic

    setPendingHabits((prev) => ({ ...prev, [habit.id]: true }));

    try {
      const nowIso = new Date().toISOString();
      const res = await api.post(`/habits/${habit.id}/toggle-completion/`, {
        date: nowIso,
        completed: !habit.completed_today,
      });
      
      const { record, habit_progress, global_progress, current_streak } = res.data;

      setHabits((prev) => {
        const updated = prev.map((h) =>
          h.id === habit.id
            ? { 
                ...h, 
                completed_today: record.completed,
                progress: habit_progress,
                current_streak,
              }
            : h
        );

        const sorted = updated.sort((a, b) => a.completed_today - b.completed_today);

        if (onStatsChange) {
          const completed = sorted.filter(h => h.completed_today).length;
          onStatsChange({ completed, total: sorted.length });
        }

        return sorted;
      });

      if (record.completed && !habit.completed_today) {
        triggerCompletionPulse(habit.id); // FEATURE: pulso
        toast.success(`Completaste "${habit.name}" hoy (+${habit_progress.experience} XP)`);
      } else {
        toast(`Desmarcaste "${habit.name}" (-25 XP)`, {
          icon: '❌',
          style: {
            color: '#fff',
          },
        });
      }

      if (onProgressChange) {
        onProgressChange(global_progress); // 🔁 actualiza la barra global
      }
    } catch (error) {
      console.error("❌ Error al actualizar el hábito", error);
      toast.error("Error al actualizar el hábito");
    } finally {
      setPendingHabits((prev) => ({ ...prev, [habit.id]: false }));
    }
  };

  const handleUpdateProgress = async (habit, direction) => {
    if (pendingHabits[habit.id]) return;

    setPendingHabits((prev) => ({ ...prev, [habit.id]: true }));

    try {
      const res = await api.post(`/habits/${habit.id}/update-progress/`, {
        direction,
      });

      const { record, habit_progress, global_progress, current_streak } = res.data;

      setHabits((prev) => {
        const updated = prev.map((h) => 
          h.id === habit.id 
            ? {
                ...h,
                completed_today: record.completed,
                current_progress: record.progress,
                progress: habit_progress,
                current_streak,
            }
          : h
        );

        const sorted = updated.sort((a, b) => a.completed_today - b.completed_today);

        if (onStatsChange) {
          const completed = sorted.filter((h) => h.completed_today).length;
          onStatsChange({ completed, total: sorted.length });
        }

        return sorted;
      });

      if (record.completed && !habit.completed_today) {
        triggerCompletionPulse(habit.id); //FEATURE: pulso
        toast.success(`Completaste "${habit.name}" hoy (+${habit_progress.experience} XP)`);
      }

      if (onProgressChange) {
        onProgressChange(global_progress);
      }
    } catch (error) {
      console.error("❌ Error al actualizar el progreso", error);
      toast.error("Error al actualizar el progreso");
    } finally {
      setPendingHabits((prev) => ({ ...prev, [habit.id]: false }));
    }
  };

  // Aclara un color hex (valor entre 0 y 1)
  const lightenColor = (color, amount) => {
    try {
      let col = color.replace("#", "");
      if (col.length === 3) col = col.split("").map(c => c + c).join("");

      const num = parseInt(col, 16);
      let r = (num >> 16) + Math.round(255 * amount);
      let g = ((num >> 8) & 0x00ff) + Math.round(255 * amount);
      let b = (num & 0x0000ff) + Math.round(255 * amount);

      r = Math.min(255, r);
      g = Math.min(255, g);
      b = Math.min(255, b);

      return `rgb(${r}, ${g}, ${b})`;
    } catch {
      return color; // fallback si algo falla
    }
  };

  // FEATURE: calcula la letra del día correspondiente a cada posición del historial (L M X J V S D)
  const getWeekdayLetter = (idx) => {
    const letters = ["D", "L", "M", "X", "J", "V", "S"]; // índice = getDay() (0=domingo)
    const today = new Date();
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - idx));
    return letters[date.getDay()];
  };

  // FEATURE: borde que va de gris a color de categoría según el % de avance
  const getBorderColor = (habit) => {
    if (habit.completed_today) return habit.category?.color || "#6366f1";
    const target = habit.target_per_period || 1;
    const progress = habit.target_per_period > 1 ? habit.current_progress : 0;
    const percent = progress / target;
    if (percent === 0) return "#d1d5db"; // gris neutro, sin avance
    return lightenColor(habit.category?.color || "#4951E4", 0.5 - percent * 0.3);
  };

  // FEATURE: racha en riesgo - después de las 8pm sin completar, atenúa el ícono de fuego
  const isStreakAtRisk = (habit) => {
    const hour = new Date().getHours();
    return hour >= 20 && !habit.completed_today && habit.current_streak > 0;
  };

  // FEATURE: evita doble clic mientras la petición está en curso
  const [pendingHabits, setPendingHabits] = useState({});

  return (
    <section className="w-full max-w-6xl">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Tus Hábitos</h2>
        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/categories")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 border-2 border-gray-200 text-white text-sm sm:text-base font-medium hover:bg-white hover:text-indigo-600 px-3 sm:px-4 py-2 rounded-xl shadow transition-all cursor-pointer"
          >
            <Tags size={16} />
            Categorías
          </button>
          <button
            onClick={handleNewHabit}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-indigo-600 text-sm sm:text-base font-medium hover:bg-indigo-600 hover:text-white px-3 sm:px-4 py-2 rounded-xl shadow transition-all cursor-pointer"
          >
            <Plus size={16} />
            Nuevo Hábito
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <p className="text-gray-400">No tienes hábitos registrados todavía.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {habits.map((habit) => {
            const target = habit.target_per_period || 1;
            const progress = habit.target_per_period > 1 ? habit.current_progress : (habit.completed_today ? 1 : 0);
            const percent = Math.min((progress / target) * 100, 100);
            const isFullyDone = habit.completed_today;

            return (
              <div
                key={habit.id}
                style={{ borderColor: getBorderColor(habit) }}
                className={`relative overflow-hidden bg-black rounded-xl border-2 p-6 md:p-8 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col ${
                  justCompleted[habit.id] ? "scale-[1.02]" : "scale-100"
                }`}
              >
                {/* FEATURE: relleno tipo "carga" que llena la tarjeta según el progreso */}
                <div
                  className="absolute inset-0 transition-all duration-500 ease-out"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: isFullyDone
                      ? "#4951E410" 
                      : `${habit.category?.color || "#4951E4"}20`,
                  }}
                />

                {/* FEATURE: check animado que aparece al llegar al 100% */}
                {justCompleted[habit.id] && (
                  <div className="absolute top-4 right-14 z-20 animate-pop-in">
                    <div className="bg-green-600 rounded-full p-1.5">
                      <Check size={16} className="text-white" />
                    </div>
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {habit.target_per_period > 1 ? (
                        // Stepper para hábitos con meta múltiple
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleUpdateProgress(habit, "decrement")}
                            disabled={habit.current_progress === 0}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="text-sm font-semibold text-white min-w-[36px] text-center">
                            {habit.current_progress ?? 0}/{habit.target_per_period}
                          </span>
                          <button
                            onClick={() => handleUpdateProgress(habit, "increment")}
                            disabled={habit.current_progress >= habit.target_per_period}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        // Checkbox normal para hábitos de meta simple
                        <input
                          type="checkbox"
                          checked={!!habit.completed_today}
                          onChange={() => handleToggleCompletion(habit)}
                          disabled={pendingHabits[habit.id]}
                          className="w-5 h-5 mt-2 shrink-0 appearance-none rounded-full border-2 border-gray-400 bg-white checked:bg-green-600 checked:border-green-600 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                        />
                      )}
                      <div>
                        <h3 className={`text-lg md:text-2xl duration-200 ${
                          habit.completed_today ? "line-through text-gray-600" : "text-white font-semibold"
                        }`}>
                          {habit.name}
                        </h3>
                        <p className="text-sm md:text-base text-gray-400 mt-2">
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
                      className="border-2 px-2 py-1 text-xs rounded-full font-semibold"
                      style={{
                        borderColor: habit.category?.color || "#4951E4",
                        color: habit.category?.color || "#4951E4",
                        backgroundColor: `${habit.category?.color || "#4951E4"}30`,
                      }}
                    >
                      {habit.category?.name || "Sin categoría"}
                    </span>
                    <div className="flex items-center gap-1">
                      {/* FEATURE: racha en riesgo - el fuego se atenúa después de las 8pm sin completar */}
                      <Flame
                        className={isStreakAtRisk(habit) ? "text-orange-900" : "text-orange-500"}
                        size={20}
                      />
                      <span className={isStreakAtRisk(habit) ? "text-orange-900" : ""}>
                        {habit.current_streak ?? 0} días
                      </span>
                    </div>
                  </div>

                  {/* FEATURE: historial visual de 7 días (solo la letra, coloreada si se completó) */}
                  {habit.week_history && (
                    <div className="flex items-center gap-2.5 mt-3">
                      {habit.week_history.map((completed, idx) => {
                        const dayLetter = getWeekdayLetter(idx);
                        return (
                          <span
                            key={idx}
                            className="text-sm font-bold transition-colors"
                            style={{
                              color: completed ? (habit.category?.color || "#4951E4") : "#4b5563",
                            }}
                            title={idx === 6 ? "Hoy" : `Hace ${6 - idx} días`}
                          >
                            {dayLetter}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Barra de experiencia */}
                  {habit.progress && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Nivel {habit.progress.level}</span>
                        <span>
                          {habit.progress.experience} / {habit.progress.xp_to_next} XP
                        </span>
                      </div>

                      <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.min(
                              (habit.progress.experience / habit.progress.xp_to_next) * 100,
                              100
                            )}%`,
                            background: `linear-gradient(90deg, 
                              ${lightenColor(habit.category?.color || "#4951E4", 0.3)}, 
                              ${habit.category?.color || "#4951E4"})`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
