/**
 * Días de la semana, de lunes a domingo.
 */
export const DAYS_OF_WEEK = ["L", "M", "X", "J", "V", "S", "D"];

/**
 * Los 7 días que muestra el historial: de hace 6 días hasta HOY (así lo devuelve el backend).
 * Cada letra se calcula con la fecha real; antes se rotulaba siempre L-M-X-J-V-S-D
 * y las letras no coincidían con los días.
 * @return {{label: string, name: string, isToday: boolean}[]}
 */
export function getLastSevenDays(today = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return {
      label: DAYS_OF_WEEK[(d.getDay() + 6) % 7], // getDay(): 0 = domingo
      name: d.toLocaleDateString("es-CO", { weekday: "long" }),
      isToday: i === 6,
    };
  });
}

/**
 * Aclara un color HEX sumándole un porcentaje de blanco.
 * @param {string} color - Color en formato HEX (#RRGGBB).
 * @param {number} amount - Porcentaje de aclarado (0 a 1).
 * @return {string} Color formateado en rgb().
 */
export function lightenColor(color, amount) {
  try {
    let col = (color || "#4951E4").replace("#", "");
    if (col.length === 3) col = col.split("").map((c) => c + c).join("");

    const num = parseInt(col, 16);
    const r = (num >> 16) + Math.round(255 * amount);
    const g = ((num >> 8) & 0x00ff) + Math.round(255 * amount);
    const b = (num & 0x0000ff) + Math.round(255 * amount);

    return `rgb(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)})`;
  } catch {
    return color || "#4951E4";
  }
}

// ---------------------------------------------------------------------------
// Frecuencias (diario, semanal, mensual)
// ---------------------------------------------------------------------------

// OJO: los topes (5 y 28) están duplicados del backend (MAX_WEEKLY_TARGET y MAX_MONTHLY_TARGET).
// Aquí solo sirven de AYUDA al usuario; la autoridad es el servidor, que responde 400 si no se cumplen.
export const FREQUENCY_CONFIG = {
  daily: {
    label: "Diario",
    targetLabel: "Meta por día",
    targetHelp: "Cuántas veces al día lo harás (ej. 3 vasos de agua).",
    maxTarget: null,
  },
  weekly: {
    label: "Semanal",
    targetLabel: "Días por semana",
    targetHelp: "En cuántos días distintos de la semana lo harás (de 1 a 5).",
    maxTarget: 5,
  },
  monthly: {
    label: "Mensual",
    targetLabel: "Días por mes",
    targetHelp: "En cuántos días distintos del mes lo harás (de 1 a 28).",
    maxTarget: 28,
  },
};

/** Configuración de una frecuencia. Si llega una desconocida (o ninguna), se trata como diaria. */
export function getFrequencyConfig(frequency) {
  return FREQUENCY_CONFIG[frequency] ?? FREQUENCY_CONFIG.daily;
}

/** Deja la meta como un entero entre 1 y el tope de la frecuencia (el diario no tiene tope). */
export function clampTarget(frequency, target) {
  const { maxTarget } = getFrequencyConfig(frequency);
  let value = Math.floor(Number(target));
  if (!Number.isFinite(value) || value < 1) value = 1;
  if (maxTarget !== null && value > maxTarget) value = maxTarget;
  return value;
}

/** ¿Es un hábito diario? Si el objeto no trae frecuencia, se asume diario. */
export function isDailyHabit(habit) {
  return (habit?.frequency ?? "daily") === "daily";
}

/**
 * ¿Pide atención hoy? (se usa para ordenar: lo pendiente va primero)
 * Diario: no completado hoy. Semanal/mensual: no marcado hoy y con la meta del periodo sin cumplir.
 */
export function needsAttention(habit) {
  if (isDailyHabit(habit)) return !habit.completed_today;
  return !habit.completed_today && !habit.period_met;
}

// ---------------------------------------------------------------------------
// Fechas de calendario
// ---------------------------------------------------------------------------

/**
 * Convierte "2026-11-02" en una fecha LOCAL a medianoche.
 * new Date("2026-11-02") interpreta la cadena como medianoche en UTC, que en Bogotá
 * es el 1 de noviembre: por eso se construye con año, mes y día.
 */
export function parseISODate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const MS_PER_DAY = 86_400_000;

// Número de día de calendario. Date.UTC evita que un cambio de hora altere la cuenta.
function dayNumber(date) {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY);
}

/** Días de calendario de `from` a `to` (positivo si `to` es posterior). */
export function daysBetween(from, to) {
  return dayNumber(to) - dayNumber(from);
}

/**
 * Los 7 días de la semana calendario (lunes a domingo) de un hábito semanal.
 * `weekHistory` son los últimos 7 días terminando HOY (como lo devuelve el backend).
 * @return {{label: string, name: string, state: "done"|"missed"|"future", isToday: boolean}[]}
 */
export function getCalendarWeek(periodStart, weekHistory, today = new Date()) {
  const start = parseISODate(periodStart);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const daysAgo = daysBetween(date, today); // >0 pasado, 0 hoy, <0 futuro

    let state = "future";
    if (daysAgo >= 0) {
      state = weekHistory?.[6 - daysAgo] ? "done" : "missed";
    }

    return {
      label: DAYS_OF_WEEK[(date.getDay() + 6) % 7],
      name: date.toLocaleDateString("es-CO", { weekday: "long" }),
      state,
      isToday: daysAgo === 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Textos del estado de un hábito (calculado por el backend; aquí solo se formatea)
// ---------------------------------------------------------------------------
const pluralize = (n, one, many) => (n === 1 ? one : many);

/** Avance del periodo en curso: { done, target, percent, met, label }. */
export function getPeriodProgress(habit) {
  const done = habit.days_done ?? 0;
  const target = habit.period_target ?? 1;
  const noun = habit.frequency === "monthly" ? "este mes" : "esta semana";

  // Con días extra (ya pasaste la meta) "4 de 3" confundiría: se muestra la meta aparte
  const label =
    done > target
      ? `${done} días ${noun} (meta: ${target})`
      : `${done} de ${target} ${pluralize(target, "día", "días")} ${noun}`;

  return {
    done,
    target,
    percent: Math.min(100, Math.round((done / target) * 100)),
    met: Boolean(habit.period_met),
    label,
  };
}

/** Racha para la tarjeta: "5 días" en diarios; "9 veces" en semanales y mensuales. */
export function formatStreak(habit) {
  const n = habit.streak_times ?? habit.current_streak ?? 0;
  if (isDailyHabit(habit)) return `${n} ${pluralize(n, "día", "días")}`;
  return `${n} ${pluralize(n, "vez", "veces")}`;
}

/** Detalle de la racha por periodos ("2 semanas cumplidas"); vacío en diarios. */
export function formatStreakDetail(habit) {
  if (isDailyHabit(habit)) return "";
  const n = habit.streak_periods ?? 0;
  if (habit.frequency === "monthly") {
    return `${n} ${pluralize(n, "mes", "meses")} ${pluralize(n, "cumplido", "cumplidos")}`;
  }
  return `${n} ${pluralize(n, "semana", "semanas")} ${pluralize(n, "cumplida", "cumplidas")}`;
}

// ---------------------------------------------------------------------------
// Mensajes (toasts) al marcar o desmarcar
// ---------------------------------------------------------------------------

/**
 * Qué avisar al usuario tras marcar o desmarcar un hábito.
 * @param {object} habit - El hábito ANTES de la acción (necesita name, frequency y completed_today).
 * @param {object} data - Respuesta del backend (record.completed, xp y bonus).
 * @return {{kind: "success"|"info"|"bonus", text: string}[]} Lista de mensajes (vacía si no hubo cambio).
 */
export function describeCompletionChange(habit, data) {
  const nowCompleted = Boolean(data?.record?.completed);
  if (nowCompleted === Boolean(habit.completed_today)) return [];

  const periodic = !isDailyHabit(habit);
  const periodWord = habit.frequency === "monthly" ? "mensual" : "semanal";
  const periodOf = habit.frequency === "monthly" ? "del mes" : "de la semana";

  const bonus = data.bonus ?? { action: "none", xp_habit: 0 };
  const bonusDelta =
    bonus.action === "granted" ? bonus.xp_habit : bonus.action === "revoked" ? -bonus.xp_habit : 0;
  // El xp de la respuesta es NETO (día + bonus): se separa para no contar el bonus dos veces
  const dayXp = (data.xp?.habit ?? 0) - bonusDelta;

  const messages = [];

  if (nowCompleted) {
    if (dayXp > 0) {
      messages.push({ kind: "success", text: `Completaste "${habit.name}" hoy (+${dayXp} XP)` });
    } else if (periodic && bonus.action !== "granted") {
      messages.push({
        kind: "info",
        text: `Registraste "${habit.name}" hoy. Ya cumpliste la meta ${periodOf}: los días extra suman a tu racha, pero no dan XP`,
      });
    } else {
      messages.push({ kind: "success", text: `Completaste "${habit.name}" hoy` });
    }
    if (bonus.action === "granted") {
      messages.push({ kind: "bonus", text: `¡Meta ${periodWord} cumplida! Bonus +${bonus.xp_habit} XP` });
    }
  } else {
    if (dayXp < 0) {
      messages.push({ kind: "info", text: `Desmarcaste "${habit.name}" (-${Math.abs(dayXp)} XP)` });
    } else {
      messages.push({ kind: "info", text: `Desmarcaste "${habit.name}"` });
    }
    if (bonus.action === "revoked") {
      messages.push({
        kind: "info",
        text: `Se revirtió el bonus de la meta ${periodWord} (-${bonus.xp_habit} XP)`,
      });
    }
  }

  return messages;
}

/**
 * Determina si la racha de un hábito está en riesgo, durante TODO el día.
 *
 * Regla de negocio (coherente con el backend, que tolera UN día fallado y rompe
 * la racha con DOS seguidos): hay riesgo cuando existe una racha activa, ayer no
 * se completó y hoy tampoco. Si hoy tampoco se completa, la racha se rompe.
 *
 * @param {object} habit - Objeto del hábito.
 * @return {boolean} True si está en riesgo.
 */
export function isStreakAtRisk(habit) {
  return (
    habit.current_streak > 0 &&
    !habit.completed_today &&
    habit.yesterday_completed === false
  );
}

/**
 * Calcula o formatea el valor real de la racha a mostrar.
 * Si no se ha completado hoy, preserva el valor acumulado hasta ayer.
 */
export function getDisplayStreak(habit) {
  if (!habit) return 0;

  // Si la API o el estado trae current_streak, lo usamos directamente
  if (typeof habit.current_streak === "number") {
    return habit.current_streak;
  }

  // Si se calcula desde el historial de días
  if (Array.isArray(habit.week_history)) {
    let streak = 0;
    const history = habit.week_history;
    const startIndex = habit.completed_today ? history.length - 1 : history.length - 2;

    for (let i = startIndex; i >= 0; i--) {
      if (history[i]) {
        streak++;
      } else {
        break;
      }
    }

    return habit.completed_today ? streak + 1 : streak;
  }

  return 0;
}