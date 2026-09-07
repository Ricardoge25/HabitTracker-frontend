/**
 * Días de la semana en orden fijo de Lunes a Domingo.  
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
    let r = (num >> 16) + Math.round(255 * amount);
    let g = ((num >> 8) & 0x00ff) + Math.round(255 * amount);
    let b = (num & 0x0000ff) + Math.round(255 * amount);

    return `rgb(${Math.min(255, r)}, ${Math.min(255, g)}, ${Math.min(255, b)})`;
  } catch {
    return color || "#4951E4";
  }
};

/**
 * Determina si la racha de un hábito está en riesgo (después de las 8:00 PM sin completar).
 * @param {object} habit - Objeto del hábito.
 * @return {boolean} True si está en riesgo.
 */
export function isStreakAtRisk(habit) {
  const hour = new Date().getHours();
  return hour >= 20 && !habit.completed_today && habit.current_streak > 0;
};

/**
 * Calcula el color del borde de la tarjeta del hábito según su progreso.
 * @param {Object} habit - Objeto del hábito.
 * @return {string} Color para el borde.
 */
export function getBorderColor(habit) {
  if (habit.completed_today) return habit.category?.color || "#6366f1";
  const target = habit.target_per_period || 1;
  const progress = habit.target_per_period > 1 ? habit.current_progress : 0;
  const percent = progress / target;
  if (percent === 0) return "#d1d5db";
  return lightenColor(habit.category?.color || "#4951E4", 0.5 - percent * 0.3);
};

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
