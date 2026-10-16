import { useCallback, useEffect, useState } from "react";
import { Plus, Sprout } from "lucide-react";
import { toast } from "react-hot-toast";
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

  const [habits, setHabits] = useState([]);
  const [loaded, setLoaded] = useState(false);
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
    } finally {
      setLoaded(true);
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
      toast.error(
        err.response?.status === 400
          ? extractApiError(err.response.data)
          : "❌ No se pudo guardar el hábito"
      );
    }
  };

  const requestDeleteHabit = (habitId) => {
    setHabitToDelete(habits.find((h) => h.id === habitId) ?? null);
  };

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

  const withPending = async (habitId, action) => {
    if (pendingHabits[habitId]) return;
    setPendingHabits((prev) => ({ ...prev, [habitId]: true }));
    try {
      await action();
    } finally {
      setPendingHabits((prev) => ({ ...prev, [habitId]: false }));
    }
  };

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
    <section className="w-full" aria-labelledby="habits-title">
      {/* Encabezado de la sección */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="habits-title" className="text-xl font-bold text-ink sm:text-2xl">
            Tus hábitos
          </h2>
          {loaded && habits.length > 0 && (
            <p className="mt-0.5 text-sm text-ink-muted">
              {habits.length} {habits.length === 1 ? "hábito" : "hábitos"} activos
            </p>
          )}
        </div>
        <button type="button" onClick={handleNewHabit} className="btn btn-primary">
          <Plus size={18} />
          Nuevo hábito
        </button>
      </div>

      {/* Contenido: carga, vacío o lista */}
      {!loaded ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i} className="card h-44 animate-pulse" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-12 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent-soft">
            <Sprout size={28} />
          </span>
          <h3 className="text-lg font-semibold text-ink">Aún no tienes hábitos</h3>
          <p className="mt-1 max-w-xs text-sm text-ink-muted">
            Empieza con uno pequeño. La constancia pesa más que la intensidad.
          </p>
          <button type="button" onClick={handleNewHabit} className="btn btn-primary mt-6">
            <Plus size={18} />
            Crear mi primer hábito
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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

      <HabitModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveHabit}
        habit={editingHabit}
        categories={categories}
        fetchCategories={fetchCategories}
      />

      {habitToDelete && (
        <ConfirmDialog
          title="¿Eliminar este hábito?"
          message={
            <>
              Vas a eliminar <strong className="text-ink">{habitToDelete.name}</strong>. Se
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