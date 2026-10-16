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