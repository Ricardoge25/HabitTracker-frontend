/**
 * Días de la semana, de lunes a domingo.
 */
export const DAYS_OF_WEEK = ["L", "M", "X", "J", "V", "S", "D"];

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

// Canal sRGB (0-255) a luminancia lineal, según la fórmula de WCAG 2
function channelToLinear(value) {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

// Luminancia relativa de un color HEX (0 = negro, 1 = blanco); null si no es un HEX válido
function relativeLuminance(color) {
  let hex = String(color ?? "").trim().replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;

  const num = parseInt(hex, 16);
  const r = channelToLinear(num >> 16);
  const g = channelToLinear((num >> 8) & 0xff);
  const b = channelToLinear(num & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const TEXT_ON_DARK = "#d4d4d4";
const TEXT_ON_LIGHT = "#303030"; // el mismo tono que --color-canvas
// 3:1 es el mínimo de WCAG para texto grande y elementos gráficos. La letra del día
// es un apoyo (la posición ya dice qué día es), así que se exige 3:1 y no 4.5:1.
// Con 4.5:1 casi toda la paleta pasaría a texto oscuro, aunque el blanco se lea bien.
const MIN_WHITE_CONTRAST = 3;

/**
 * Color de texto legible sobre un fondo: blanco mientras contraste al menos 3:1,
 * y si no (amarillo, cian, verde claro...) el oscuro de la app.
 * @param {string} background - Color HEX del fondo (#RGB o #RRGGBB).
 * @return {string} "#d4d4d4" o "#303030".
 */
export function getContrastTextColor(background) {
  const luminance = relativeLuminance(background);
  if (luminance === null) return TEXT_ON_DARK;

  const contrastWithWhite = 1.05 / (luminance + 0.05);
  return contrastWithWhite >= MIN_WHITE_CONTRAST ? TEXT_ON_DARK : TEXT_ON_LIGHT;
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

/** Lunes de la semana de `date`, a medianoche local. No modifica la fecha recibida. */
export function startOfWeek(date = new Date()) {
  const daysSinceMonday = (date.getDay() + 6) % 7; // getDay(): 0 = domingo
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysSinceMonday);
}

/**
 * Los 7 días de la semana calendario (lunes a domingo).
 * `periodStart` es el lunes: "YYYY-MM-DD" (el period.start de un semanal) o un Date
 * (los diarios usan startOfWeek()). `weekHistory` son los últimos 7 días terminando
 * HOY, como los devuelve el backend: alcanzan porque el lunes está a lo sumo 6 días atrás.
 * @return {{label: string, name: string, state: "done"|"missed"|"future", isToday: boolean}[]}
 */
export function getCalendarWeek(periodStart, weekHistory, today = new Date()) {
  const start =
    typeof periodStart === "string"
      ? parseISODate(periodStart)
      : new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
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