import React from "react";
import { Flame, MoreVertical, Plus, Minus, Check, Edit2, Trash2 } from "lucide-react";
import { DAYS_OF_WEEK, lightenColor, isStreakAtRisk, getBorderColor } from "../utils/habitUtils";

export default function HabitCard({
  habit,
  openMenuId,
  setOpenMenuId,
  justCompleted,
  pendingHabits,
  onToggleCompletion,
  onUpdateProgress,
  onEditHabit,
  onDeleteHabit,
}) {
  const target = habit.target_per_period || 1;
  const progress =
    habit.target_per_period > 1
      ? habit.current_progress
      : habit.completed_today
      ? 1
      : 0;
  const percent = Math.min((progress / target) * 100, 100);
  const isFullyDone = habit.completed_today;

  return (
    <div
      style={{ borderColor: getBorderColor(habit) }}
      className={`relative overflow-hidden bg-black rounded-xl border-2 p-6 md:p-8 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col ${
        justCompleted[habit.id] ? "scale-[1.02]" : "scale-100"
      }`}
    >
      {/* Relleno tipo carga */}
      <div
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          width: `${percent}%`,
          backgroundColor: isFullyDone
            ? "#4951E410"
            : `${habit.category?.color || "#4951E4"}20`,
        }}
      />

      {/* Check animado */}
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
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onUpdateProgress(habit, "decrement")}
                  disabled={habit.current_progress === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <Minus size={16} />
                </button>
                <span className="text-sm font-semibold text-white min-w-[36px] text-center">
                  {habit.current_progress ?? 0}/{habit.target_per_period}
                </span>
                <button
                  onClick={() => onUpdateProgress(habit, "increment")}
                  disabled={habit.current_progress >= habit.target_per_period}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <input
                type="checkbox"
                checked={!!habit.completed_today}
                onChange={() => onToggleCompletion(habit)}
                disabled={pendingHabits[habit.id]}
                className="w-5 h-5 mt-2 shrink-0 appearance-none rounded-full border-2 border-gray-400 bg-white checked:bg-green-600 checked:border-green-600 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
              />
            )}
            <div>
              <h3
                className={`text-lg md:text-2xl duration-200 ${
                  habit.completed_today
                    ? "line-through text-gray-600"
                    : "text-white font-semibold"
                }`}
              >
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
                  onClick={() => {
                    setOpenMenuId(null);
                    onEditHabit(habit);
                  }}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-t-xl"
                >
                  <Edit2 size={16} /> Editar
                </button>
                <button
                  onClick={() => {
                    setOpenMenuId(null);
                    onDeleteHabit(habit.id);
                  }}
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
            <Flame
              className={
                isStreakAtRisk(habit) ? "text-orange-900" : "text-orange-500"
              }
              size={20}
            />
            <span className={isStreakAtRisk(habit) ? "text-orange-900" : ""}>
              {habit.current_streak ?? 0} días
            </span>
          </div>
        </div>

        {/* Historial visual estático de 7 días (L M X J V S D) */}
        {habit.week_history && (
          <div className="flex items-center gap-2.5 mt-3">
            {habit.week_history.map((completed, idx) => (
              <span
                key={idx}
                className="text-sm font-bold transition-colors"
                style={{
                  color: completed
                    ? habit.category?.color || "#4951E4"
                    : "#4b5563",
                }}
                title={DAYS_OF_WEEK[idx]}
              >
                {DAYS_OF_WEEK[idx]}
              </span>
            ))}
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
                    (habit.progress.experience / habit.progress.xp_to_next) *
                      100,
                    100
                  )}%`,
                  background: `linear-gradient(90deg, 
                    ${lightenColor(
                      habit.category?.color || "#4951E4",
                      0.3
                    )}, 
                    ${habit.category?.color || "#4951E4"})`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}