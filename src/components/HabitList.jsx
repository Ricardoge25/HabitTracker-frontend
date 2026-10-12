import { useCallback, useEffect, useState } from "react";
import { Plus, Tags } from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { extractApiError } from "../utils/apiErrors";
import HabitModal from "./HabitModal";
import HabitCard from "./HabitCard";
import ConfirmDialog from "./ConfirmDialog";

// Pendientes primero. Devuelve una copia: nunca se muta el estado ni la respuesta.
const sortHabits = (list) =>
  [...list].sort((a, b) => Number(a.completed_today) - Number(b.completed_today));

export default function HabitList({ onProgressChange, onStatsChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [habits, setHabits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [justCompleted, setJustCompleted] = useState({});
  const [pendingHabits, setPendingHabits] = useState({});

  // ---------- Carga de datos ----------
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("❌ Error al obtener categorías:", error);
    }
  }, []);

  const fetchHabits = useCallback(async () => {
    try {
      const res = await api.get("/habits/today/");
      setHabits(sortHabits(res.data));
    } catch (err) {
      console.error("❌ Error cargando hábitos", err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (user) fetchHabits();
  }, [user, fetchHabits]);

  // Las estadísticas son estado DERIVADO de `habits`: se calculan, no se guardan aparte.
  useEffect(() => {
    if (!onStatsChange) return;
    onStatsChange({
      completed: habits.filter((h) => h.completed_today).length,
      total: habits.length,
    });
  }, [habits, onStatsChange]);

  // ---------- Modal de crear/editar ----------
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

  // ---------- CRUD ----------
  const handleSaveHabit = async (habitData) => {
    const isEditing = Boolean(editingHabit);
    try {
      if (isEditing) {
        await api.patch(`/habits/${editingHabit.id}/`, habitData);
      } else {
        await api.post("/habits/", habitData);
      }
      toast.success(isEditing ? "Hábito actualizado correctamente" : "🎯 Nuevo hábito creado");
      await fetchHabits(); // fuente de verdad: el servidor
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar hábito", err);
      // Solo mostramos el mensaje del servidor si es un error de validación (400)
      toast.error(
        err.response?.status === 400
          ? extractApiError(err.response.data)
          : "❌ No se pudo guardar el hábito"
      );
    }
  };

  // Paso 1: la tarjeta pide borrar -> solo abrimos la confirmación
  const requestDeleteHabit = (habitId) => {
    setHabitToDelete(habits.find((h) => h.id === habitId) ?? null);
  };

  // Paso 2: el usuario confirma -> ahora sí se llama a la API
  const confirmDeleteHabit = async () => {
    if (!habitToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/habits/${habitToDelete.id}/`);
      setHabits((prev) => prev.filter((h) => h.id !== habitToDelete.id));
      toast.success("🗑️ Hábito eliminado correctamente");
      setHabitToDelete(null);
    } catch (err) {
      toast.error("❌ Error al eliminar el hábito");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------- Completar hábitos ----------
  const triggerCompletionPulse = (habitId) => {
    setJustCompleted((prev) => ({ ...prev, [habitId]: true }));
    setTimeout(() => {
      setJustCompleted((prev) => ({ ...prev, [habitId]: false }));
    }, 3000);
  };

  // Evita dobles clics mientras hay una petición en curso para ese hábito
  const withPending = async (habitId, action) => {
    if (pendingHabits[habitId]) return;
    setPendingHabits((prev) => ({ ...prev, [habitId]: true }));
    try {
      await action();
    } finally {
      setPendingHabits((prev) => ({ ...prev, [habitId]: false }));
    }
  };

  // Aplica al estado local lo que respondió el servidor
  const applyServerResult = (habitId, data, extra = {}) => {
    const { record, habit_progress, current_streak } = data;
    setHabits((prev) =>
      sortHabits(
        prev.map((h) =>
          h.id === habitId
            ? {
                ...h,
                completed_today: record.completed,
                progress: habit_progress,
                current_streak,
                ...extra,
              }
            : h
        )
      )
    );
  };

  const handleToggleCompletion = (habit) =>
    withPending(habit.id, async () => {
      try {
        const { data } = await api.post(`/habits/${habit.id}/toggle-completion/`, {
          completed: !habit.completed_today,
        });

        applyServerResult(habit.id, data);

        if (data.record.completed && !habit.completed_today) {
          triggerCompletionPulse(habit.id);
          toast.success(
            `Completaste "${habit.name}" hoy (+${data.habit_progress.experience} XP)`
          );
        } else {
          toast(`Desmarcaste "${habit.name}" (-25 XP)`, {
            icon: "❌",
            style: { color: "#fff" },
          });
        }

        if (onProgressChange) onProgressChange(data.global_progress);
      } catch (error) {
        console.error("❌ Error al actualizar el hábito", error);
        toast.error("Error al actualizar el hábito");
      }
    });

  const handleUpdateProgress = (habit, direction) =>
    withPending(habit.id, async () => {
      try {
        const { data } = await api.post(`/habits/${habit.id}/update-progress/`, {
          direction,
        });

        applyServerResult(habit.id, data, { current_progress: data.record.progress });

        if (data.record.completed && !habit.completed_today) {
          triggerCompletionPulse(habit.id);
          toast.success(
            `Completaste "${habit.name}" hoy (+${data.habit_progress.experience} XP)`
          );
        }

        if (onProgressChange) onProgressChange(data.global_progress);
      } catch (error) {
        console.error("❌ Error al actualizar el progreso", error);
        toast.error("Error al actualizar el progreso");
      }
    });

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
              onDeleteHabit={requestDeleteHabit}
            />
          ))}
        </div>
      )}

      {/* Modal para crear/editar hábito */}
      <HabitModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveHabit}
        habit={editingHabit}
        categories={categories}
        fetchCategories={fetchCategories}
      />

      {/* Confirmación de borrado */}
      {habitToDelete && (
        <ConfirmDialog
          title="¿Eliminar este hábito?"
          message={
            <>
              Vas a eliminar <strong className="text-white">{habitToDelete.name}</strong>. Se
              borrarán también su historial y su progreso. Esta acción no se puede deshacer.
            </>
          }
          confirmLabel="Eliminar hábito"
          onConfirm={confirmDeleteHabit}
          onCancel={() => setHabitToDelete(null)}
          loading={isDeleting}
        />
      )}
    </section>
  );
}