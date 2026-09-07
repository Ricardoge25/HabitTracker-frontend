import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Plus, Tags } from "lucide-react";
import { toast } from "react-hot-toast";
import HabitModal from "./HabitModal";
import HabitCard from "./HabitCard";
import { useNavigate } from "react-router-dom";

export default function HabitList({ onProgressChange, onStatsChange }) {
  const [habits, setHabits] = useState([]);
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingHabit, setEditingHabit] = useState(null);
  const [justCompleted, setJustCompleted] = useState({});
  const [pendingHabits, setPendingHabits] = useState({});
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("❌ Error al obtener categorías:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchHabits = async () => {
    try {
      const res = await api.get("/habits/today/");
      const sortedHabits = res.data.sort(
        (a, b) => a.completed_today - b.completed_today
      );
      setHabits(sortedHabits);

      if (onStatsChange) {
        const completed = sortedHabits.filter((h) => h.completed_today).length;
        onStatsChange({ completed, total: sortedHabits.length });
      }
    } catch (err) {
      console.error("❌ Error cargando hábitos", err);
    }
  };

  useEffect(() => {
    if (user) fetchHabits();
  }, [user]);

  const handleCreateHabit = async (habitData) => {
    try {
      if (editingHabit) {
        const response = await api.patch(
          `/habits/${editingHabit.id}/`,
          habitData
        );
        if (response.status === 200) {
          setHabits((prev) =>
            prev.map((h) => (h.id === editingHabit.id ? response.data : h))
          );
          toast.success("Hábito actualizado correctamente");
        }
      } else {
        const response = await api.post("/habits/", habitData);
        if (response.status === 201) {
          setHabits((prev) => [...prev, response.data]);
          toast.success("🎯 Nuevo hábito creado");
        }
      }

      await fetchHabits();
      setEditingHabit(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error al crear/editar hábito", err);
      toast.error("❌ No se pudo crear/editar el hábito");
    }
  };

  const handleNewHabit = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHabit(null);
  };

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

  const triggerCompletionPulse = (habitId) => {
    setJustCompleted((prev) => ({ ...prev, [habitId]: true }));
    setTimeout(() => {
      setJustCompleted((prev) => ({ ...prev, [habitId]: false }));
    }, 3000);
  };

  const handleToggleCompletion = async (habit) => {
    if (pendingHabits[habit.id]) return;

    setPendingHabits((prev) => ({ ...prev, [habit.id]: true }));

    try {
      const nowIso = new Date().toISOString();
      const res = await api.post(`/habits/${habit.id}/toggle-completion/`, {
        date: nowIso,
        completed: !habit.completed_today,
      });

      const { record, habit_progress, global_progress, current_streak } =
        res.data;

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

        const sorted = updated.sort(
          (a, b) => a.completed_today - b.completed_today
        );

        if (onStatsChange) {
          const completed = sorted.filter((h) => h.completed_today).length;
          onStatsChange({ completed, total: sorted.length });
        }

        return sorted;
      });

      if (record.completed && !habit.completed_today) {
        triggerCompletionPulse(habit.id);
        toast.success(
          `Completaste "${habit.name}" hoy (+${habit_progress.experience} XP)`
        );
      } else {
        toast(`Desmarcaste "${habit.name}" (-25 XP)`, {
          icon: "❌",
          style: { color: "#fff" },
        });
      }

      if (onProgressChange) onProgressChange(global_progress);
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

      const { record, habit_progress, global_progress, current_streak } =
        res.data;

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

        const sorted = updated.sort(
          (a, b) => a.completed_today - b.completed_today
        );

        if (onStatsChange) {
          const completed = sorted.filter((h) => h.completed_today).length;
          onStatsChange({ completed, total: sorted.length });
        }

        return sorted;
      });

      if (record.completed && !habit.completed_today) {
        triggerCompletionPulse(habit.id);
        toast.success(
          `Completaste "${habit.name}" hoy (+${habit_progress.experience} XP)`
        );
      }

      if (onProgressChange) onProgressChange(global_progress);
    } catch (error) {
      console.error("❌ Error al actualizar el progreso", error);
      toast.error("Error al actualizar el progreso");
    } finally {
      setPendingHabits((prev) => ({ ...prev, [habit.id]: false }));
    }
  };

  return (
    <section className="w-full max-w-6xl">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">
          Tus Hábitos
        </h2>
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
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              justCompleted={justCompleted}
              pendingHabits={pendingHabits}
              onToggleCompletion={handleToggleCompletion}
              onUpdateProgress={handleUpdateProgress}
              onEditHabit={handleEditHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          ))}
        </div>
      )}

      {/* Modal para crear/editar hábito */}
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