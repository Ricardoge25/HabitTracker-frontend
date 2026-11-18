import { useEffect, useRef } from "react";
import { Check, Edit2, Flame, Minus, MoreVertical, Plus, Trash2, Trophy } from "lucide-react";
import {
  formatStreak,
  formatStreakDetail,
  getCalendarWeek,
  getContrastTextColor,
  getPeriodProgress,
  isDailyHabit,
  lightenColor,
  startOfWeek,
} from "../utils/habitUtils";

const DEFAULT_COLOR = "#6366f1";
const RING_RADIUS = 19;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

// Mezcla un color con transparente. Funciona con cualquier color CSS válido
// (antes se concatenaba "20" al hex, lo que solo servía con #RRGGBB).
const tint = (color, percent) => `color-mix(in srgb, ${color} ${percent}%, transparent)`;

// Anillo de progreso para hábitos DIARIOS con meta mayor a 1
function ProgressRing({ count, target, color }) {
  const offset = RING_LENGTH * (1 - Math.min(count / target, 1));
  return (
    <div
      className="relative flex h-11 w-11 shrink-0 items-center justify-center"
      role="img"
      aria-label={`${count} de ${target} completados hoy`}
    >
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
        <circle cx="22" cy="22" r={RING_RADIUS} fill="none" strokeWidth="3.5" className="stroke-surface-2" />
        <circle
          cx="22"
          cy="22"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <span className="text-[11px] font-semibold text-ink">
        {count}/{target}
      </span>
    </div>
  );
}

// Círculo de un día de la tira L-D.
// state: "done" (hecho), "missed" (pasó sin hacerse) o "future" (aún no llega).
function DayDot({ label, name, state, isToday, color }) {
  const stateClass = {
    done: "",
    missed: "bg-surface-2 text-ink-faint",
    future: "border border-dashed border-line-strong text-ink-faint/60",
  }[state];

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        title={name}
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${stateClass} ${
          isToday ? "ring-2 ring-accent-soft ring-offset-2 ring-offset-surface" : ""
        }`}
        // Fondo = color de la categoría; la letra se elige para que se lea sobre él
        style={state === "done" ? { backgroundColor: color, color: getContrastTextColor(color) } : undefined}
      >
        {label}
      </span>
    </div>
  );
}

// Tira de lunes a domingo. Los semanales usan el inicio de periodo que manda el backend
// y muestran cuántos días llevan; los diarios usan el lunes de esta semana y no llevan texto.
function CalendarWeek({ habit, color }) {
  const isWeekly = habit.frequency === "weekly" && Boolean(habit.period?.start);
  const week = getCalendarWeek(isWeekly ? habit.period.start : startOfWeek(), habit.week_history);
  return (
    <div className="mt-4">
      {isWeekly && (
        <p className="mb-2 text-xs font-medium text-ink-muted">{getPeriodProgress(habit).label}</p>
      )}
      <div className="grid grid-cols-7 gap-1.5" aria-label="Semana actual, de lunes a domingo">
        {week.map((day, idx) => (
          <DayDot key={idx} {...day} color={color} />
        ))}
      </div>
    </div>
  );
}

// Mensual: barra de días hechos frente a la meta del mes
function MonthProgress({ habit, color }) {
  const { label, percent, met } = getPeriodProgress(habit);
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex justify-between text-xs text-ink-muted">
        <span>{label}</span>
        <span className={met ? "font-semibold text-success" : ""}>{percent}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-label="Avance de la meta del mes"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%`, backgroundColor: met ? "var(--color-success)" : color }}
        />
      </div>
    </div>
  );
}

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
  const isDaily = isDailyHabit(habit);
  // El mensual muestra barra; diarios y semanales, la tira L-D.
  // Sin periodo (backend viejo) un mensual cae en la tira, como si fuera diario.
  const showsMonthBar = habit.frequency === "monthly" && Boolean(habit.period?.start);
  const target = habit.target_per_period || 1;
  // El stepper SOLO existe en diarios: en semanales y mensuales la meta son DÍAS,
  // y un día se marca una sola vez (por eso update-progress responde 400 en esos casos)
  const usesStepper = isDaily && target > 1;
  const done = Boolean(habit.completed_today);
  const count = usesStepper ? habit.current_progress ?? 0 : done ? 1 : 0;
  const color = habit.category?.color || DEFAULT_COLOR;
  const streakTimes = habit.streak_times ?? habit.current_streak ?? 0;
  const atRisk = Boolean(habit.at_risk);
  const streakDetail = formatStreakDetail(habit);
  const busy = Boolean(pendingHabits[habit.id]);
  const celebrating = Boolean(justCompleted[habit.id]);
  const isMenuOpen = openMenuId === habit.id;

  // Tachado: el diario está "terminado" por hoy. El semanal o mensual sigue vivo
  // durante todo el periodo, así que no se tacha aunque hoy ya esté marcado.
  const strikeTitle = isDaily && done;

  // Cerrar el menú con clic fuera o con Escape
  const menuRef = useRef(null);
  useEffect(() => {
    if (!isMenuOpen) return;
    const onMouseDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpenMenuId(null);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen, setOpenMenuId]);

  const stepperButton =
    "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line-strong text-ink transition hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-40";

  const checkLabel = isDaily
    ? done
      ? `Desmarcar ${habit.name}`
      : `Completar ${habit.name}`
    : done
    ? `Desmarcar hoy en ${habit.name}`
    : `Marcar hoy en ${habit.name}`;

  return (
    <article
      className={`card relative p-4 pl-5 transition-shadow sm:p-5 sm:pl-6 ${
        celebrating ? "ring-2 ring-success/50" : ""
      }`}
    >
      {/* Franja lateral con el color de la categoría */}
      <span
        aria-hidden="true"
        className="absolute inset-y-4 left-0 w-1 rounded-r-full"
        style={{ backgroundColor: color }}
      />

      {/* Fila principal: control + título + menú */}
      <div className="flex items-start gap-3">
        {usesStepper ? (
          <ProgressRing count={count} target={target} color={color} />
        ) : (
          <button
            type="button"
            role="checkbox"
            aria-checked={done}
            aria-label={checkLabel}
            disabled={busy}
            onClick={() => onToggleCompletion(habit)}
            className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft disabled:cursor-wait disabled:opacity-60 ${
              done
                ? "border-success bg-success text-white"
                : "border-line-strong text-transparent hover:border-accent-soft hover:text-ink-faint"
            }`}
          >
            <Check size={22} className={celebrating ? "animate-pop-in" : ""} />
          </button>
        )}

        <div className="min-w-0 flex-1 pt-0.5">
          <h3
            className={`break-words text-base font-semibold leading-snug sm:text-lg ${
              strikeTitle ? "text-ink-faint line-through" : "text-ink"
            }`}
          >
            {habit.name}
          </h3>
          {habit.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-ink-muted">{habit.description}</p>
          )}
        </div>

        {/* Menú */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            aria-label="Opciones del hábito"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setOpenMenuId(isMenuOpen ? null : habit.id)}
            className="-mr-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
          >
            <MoreVertical size={20} />
          </button>

          {isMenuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-line bg-surface-2 py-1 shadow-xl shadow-black/40"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpenMenuId(null);
                  onEditHabit(habit);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-ink transition hover:bg-line"
              >
                <Edit2 size={16} /> Editar
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpenMenuId(null);
                  onDeleteHabit(habit.id);
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-red-300 transition hover:bg-line"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chips + stepper */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            style={{ color, backgroundColor: tint(color, 15), borderColor: tint(color, 35) }}
          >
            {habit.category?.name || "Sin categoría"}
          </span>

          <span
            title={streakDetail || undefined}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
              streakTimes === 0
                ? "border-line text-ink-faint"
                : atRisk
                ? "border-warning/40 bg-warning/10 text-amber-300"
                : "border-orange-500/30 bg-orange-500/10 text-orange-300"
            }`}
          >
            <Flame size={14} />
            {formatStreak(habit)}
          </span>

          {habit.bonus_earned && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-green-300"
              title={`Meta ${habit.frequency === "monthly" ? "del mes" : "de la semana"} cumplida`}
            >
              <Trophy size={14} />+{habit.bonus_earned.xp_habit} XP
            </span>
          )}

          {atRisk && (
            <span
              className="animate-pulse text-xs font-semibold text-amber-300"
              title={
                isDaily
                  ? "Tu racha está en riesgo: complétalo hoy para no perderla"
                  : "Tu racha está en riesgo: aún puedes cumplir la meta de este periodo"
              }
            >
              En riesgo
            </span>
          )}
        </div>

        {usesStepper && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Restar uno"
              disabled={busy || count === 0}
              onClick={() => onUpdateProgress(habit, "decrement")}
              className={stepperButton}
            >
              <Minus size={16} />
            </button>
            <span className="min-w-10 text-center text-sm font-semibold text-ink">
              {count}/{target}
            </span>
            <button
              type="button"
              aria-label="Sumar uno"
              disabled={busy || count >= target}
              onClick={() => onUpdateProgress(habit, "increment")}
              className={stepperButton}
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Historial según la frecuencia */}
      {showsMonthBar ? (
        <MonthProgress habit={habit} color={color} />
      ) : (
        Array.isArray(habit.week_history) && <CalendarWeek habit={habit} color={color} />
      )}

      {/* XP del hábito */}
      {habit.progress && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-ink-muted">
            <span>Nivel {habit.progress.level}</span>
            <span>
              {habit.progress.experience} / {habit.progress.xp_to_next} XP
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min((habit.progress.experience / habit.progress.xp_to_next) * 100, 100)}%`,
                background: `linear-gradient(90deg, ${lightenColor(color, 0.3)}, ${color})`,
              }}
            />
          </div>
        </div>
      )}
    </article>
  );
}