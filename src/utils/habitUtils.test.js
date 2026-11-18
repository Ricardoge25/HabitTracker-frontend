import { describe, it, expect } from "vitest";
import {
  clampTarget,
  daysBetween,
  describeCompletionChange,
  formatStreak,
  formatStreakDetail,
  getCalendarWeek,
  getContrastTextColor,
  getFrequencyConfig,
  getPeriodProgress,
  isDailyHabit,
  lightenColor,
  needsAttention,
  parseISODate,
  startOfWeek,
} from "./habitUtils";

describe("lightenColor", () => {
  it("aclara un color sumándole blanco", () => {
    expect(lightenColor("#000000", 0.5)).toBe("rgb(128, 128, 128)");
  });

  it("nunca pasa de 255", () => {
    expect(lightenColor("#ffffff", 0.3)).toBe("rgb(255, 255, 255)");
  });

  it("expande el formato corto #rgb", () => {
    expect(lightenColor("#f00", 0)).toBe("rgb(255, 0, 0)");
  });

  it("usa el color por defecto cuando no recibe ninguno", () => {
    expect(lightenColor(undefined, 0)).toBe("rgb(73, 81, 228)");
  });
});

describe("getContrastTextColor", () => {
  const WHITE = "#d4d4d4";
  const DARK = "#303030";

  it("los colores claros llevan texto oscuro", () => {
    expect(getContrastTextColor("#ffff00")).toBe(DARK); // amarillo
    expect(getContrastTextColor("#00ffff")).toBe(DARK); // cian
    expect(getContrastTextColor("#22c55e")).toBe(DARK); // verde
    expect(getContrastTextColor("#ffffff")).toBe(DARK);
  });

  it("los colores oscuros o intensos mantienen el texto blanco", () => {
    expect(getContrastTextColor("#6366f1")).toBe(WHITE); // índigo (el color por defecto)
    expect(getContrastTextColor("#ef4444")).toBe(WHITE); // rojo
    expect(getContrastTextColor("#3b82f6")).toBe(WHITE); // azul
    expect(getContrastTextColor("#000000")).toBe(WHITE);
  });

  it("acepta el formato corto #rgb y mayúsculas", () => {
    expect(getContrastTextColor("#ff0")).toBe(DARK);
    expect(getContrastTextColor("#FFFF00")).toBe(DARK);
  });

  it("con un color que no entiende deja el texto blanco", () => {
    expect(getContrastTextColor(undefined)).toBe(WHITE);
    expect(getContrastTextColor("")).toBe(WHITE);
    expect(getContrastTextColor("rojo")).toBe(WHITE);
  });
});

describe("frecuencias", () => {
  it("cada frecuencia tiene su etiqueta y su tope de meta", () => {
    expect(getFrequencyConfig("daily")).toMatchObject({ targetLabel: "Meta por día", maxTarget: null });
    expect(getFrequencyConfig("weekly")).toMatchObject({ targetLabel: "Días por semana", maxTarget: 5 });
    expect(getFrequencyConfig("monthly")).toMatchObject({ targetLabel: "Días por mes", maxTarget: 28 });
  });

  it("una frecuencia desconocida se trata como diaria", () => {
    expect(getFrequencyConfig("yearly")).toBe(getFrequencyConfig("daily"));
    expect(getFrequencyConfig(undefined)).toBe(getFrequencyConfig("daily"));
  });

  it("clampTarget respeta el tope de cada frecuencia", () => {
    expect(clampTarget("weekly", 7)).toBe(5);
    expect(clampTarget("weekly", 5)).toBe(5);
    expect(clampTarget("monthly", 40)).toBe(28);
    expect(clampTarget("monthly", 28)).toBe(28);
    expect(clampTarget("daily", 10)).toBe(10); // el diario no tiene tope
  });

  it("clampTarget nunca baja de 1 y tolera entradas raras", () => {
    expect(clampTarget("weekly", 0)).toBe(1);
    expect(clampTarget("weekly", -3)).toBe(1);
    expect(clampTarget("weekly", "")).toBe(1);
    expect(clampTarget("weekly", "abc")).toBe(1);
    expect(clampTarget("weekly", "3")).toBe(3);
    expect(clampTarget("weekly", 2.9)).toBe(2);
  });

  it("isDailyHabit asume diario cuando no hay frecuencia", () => {
    expect(isDailyHabit({ frequency: "daily" })).toBe(true);
    expect(isDailyHabit({})).toBe(true);
    expect(isDailyHabit({ frequency: "weekly" })).toBe(false);
  });
});

describe("needsAttention", () => {
  it("un diario pide atención hasta que se completa hoy", () => {
    expect(needsAttention({ frequency: "daily", completed_today: false })).toBe(true);
    expect(needsAttention({ frequency: "daily", completed_today: true })).toBe(false);
  });

  it("un semanal pide atención si no se marcó hoy y la meta del periodo no está cumplida", () => {
    expect(needsAttention({ frequency: "weekly", completed_today: false, period_met: false })).toBe(true);
    expect(needsAttention({ frequency: "weekly", completed_today: true, period_met: false })).toBe(false);
    expect(needsAttention({ frequency: "weekly", completed_today: false, period_met: true })).toBe(false);
  });
});

describe("fechas de calendario", () => {
  it("parseISODate da el día correcto en cualquier zona horaria (no se corre por UTC)", () => {
    const date = parseISODate("2026-11-02");

    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 10, 2]);
    expect(date.getHours()).toBe(0);
  });

  it("daysBetween cuenta días de calendario", () => {
    expect(daysBetween(new Date(2026, 10, 2), new Date(2026, 10, 6))).toBe(4);
    expect(daysBetween(new Date(2026, 10, 6), new Date(2026, 10, 2))).toBe(-4);
    expect(daysBetween(new Date(2026, 10, 6), new Date(2026, 10, 6))).toBe(0);
  });

  it("daysBetween cruza el fin de mes, el de año y el 29 de febrero", () => {
    expect(daysBetween(new Date(2026, 11, 31), new Date(2027, 0, 1))).toBe(1);
    expect(daysBetween(new Date(2028, 1, 28), new Date(2028, 2, 1))).toBe(2);
  });
});

describe("startOfWeek", () => {
  it("devuelve el lunes de la semana a medianoche", () => {
    const monday = startOfWeek(new Date(2026, 10, 6, 15, 30)); // viernes 6-nov a las 3:30 p. m.

    expect([monday.getFullYear(), monday.getMonth(), monday.getDate()]).toEqual([2026, 10, 2]);
    expect(monday.getHours()).toBe(0);
  });

  it("el domingo pertenece a la semana que empezó el lunes anterior", () => {
    expect(startOfWeek(new Date(2026, 10, 8)).getDate()).toBe(2);
  });

  it("el lunes es su propio inicio de semana", () => {
    expect(startOfWeek(new Date(2026, 10, 2)).getDate()).toBe(2);
  });

  it("cruza el cambio de mes y de año", () => {
    const monday = startOfWeek(new Date(2027, 0, 2)); // sábado 2-ene-2027

    expect([monday.getFullYear(), monday.getMonth(), monday.getDate()]).toEqual([2026, 11, 28]);
  });

  it("no modifica la fecha recibida", () => {
    const today = new Date(2026, 10, 6, 15, 30);

    startOfWeek(today);

    expect([today.getDate(), today.getHours()]).toEqual([6, 15]);
  });
});

describe("getCalendarWeek", () => {
  // Viernes 6-nov-2026; semana lunes 2 a domingo 8. week_history cubre del sábado 31-oct al viernes 6-nov.
  const today = new Date(2026, 10, 6);

  it("devuelve la semana de lunes a domingo con las letras correctas", () => {
    const week = getCalendarWeek("2026-11-02", [false, false, false, false, false, false, false], today);

    expect(week.map((d) => d.label)).toEqual(["L", "M", "X", "J", "V", "S", "D"]);
  });

  it("marca hechos, perdidos y futuros", () => {
    // sáb31 dom1 lun2 mar3 mié4 jue5 vie6
    const history = [true, false, true, false, true, false, false];

    const week = getCalendarWeek("2026-11-02", history, today);

    expect(week.map((d) => d.state)).toEqual([
      "done",    // lunes 2
      "missed",  // martes 3
      "done",    // miércoles 4
      "missed",  // jueves 5
      "missed",  // viernes 6 (hoy, aún sin marcar)
      "future",  // sábado 7
      "future",  // domingo 8
    ]);
  });

  it("marca solo hoy como hoy", () => {
    const week = getCalendarWeek("2026-11-02", [false, false, false, false, false, false, true], today);

    expect(week.map((d) => d.isToday)).toEqual([false, false, false, false, true, false, false]);
    expect(week[4].state).toBe("done");
  });

  it("si hoy es domingo toda la semana es pasado", () => {
    const sunday = new Date(2026, 10, 8);
    // week_history termina hoy (domingo 8): el índice 0 es el lunes 2
    const history = [true, false, true, true, true, false, true];

    const week = getCalendarWeek("2026-11-02", history, sunday);

    expect(week.map((d) => d.state)).toEqual(["done", "missed", "done", "done", "done", "missed", "done"]);
    expect(week[6].isToday).toBe(true);
  });

  it("acepta el inicio de semana como Date (lo usan los diarios)", () => {
    const history = [true, false, true, false, true, false, false];

    const fromDate = getCalendarWeek(new Date(2026, 10, 2), history, today);
    const fromString = getCalendarWeek("2026-11-02", history, today);

    expect(fromDate).toEqual(fromString);
  });

  it("la semana puede cruzar de mes", () => {
    // Semana del lunes 30-nov-2026 al domingo 6-dic; hoy es miércoles 2-dic
    const week = getCalendarWeek("2026-11-30", [false, false, false, false, true, true, true], new Date(2026, 11, 2));

    expect(week.map((d) => d.label)).toEqual(["L", "M", "X", "J", "V", "S", "D"]);
    expect(week.map((d) => d.state)).toEqual(["done", "done", "done", "future", "future", "future", "future"]);
  });
});

describe("textos del estado", () => {
  it("getPeriodProgress de un semanal en curso", () => {
    const habit = { frequency: "weekly", days_done: 2, period_target: 3, period_met: false };

    expect(getPeriodProgress(habit)).toEqual({
      done: 2,
      target: 3,
      percent: 67,
      met: false,
      label: "2 de 3 días esta semana",
    });
  });

  it("getPeriodProgress de un mensual con la meta cumplida", () => {
    const habit = { frequency: "monthly", days_done: 12, period_target: 12, period_met: true };

    expect(getPeriodProgress(habit)).toMatchObject({ percent: 100, met: true, label: "12 de 12 días este mes" });
  });

  it("getPeriodProgress con días extra no muestra 'más de la meta'", () => {
    const habit = { frequency: "weekly", days_done: 4, period_target: 3, period_met: true };

    expect(getPeriodProgress(habit)).toMatchObject({ percent: 100, label: "4 días esta semana (meta: 3)" });
  });

  it("getPeriodProgress usa singular con meta de 1 día", () => {
    const habit = { frequency: "weekly", days_done: 0, period_target: 1, period_met: false };

    expect(getPeriodProgress(habit).label).toBe("0 de 1 día esta semana");
  });

  it("formatStreak: días en diarios, veces en semanales y mensuales", () => {
    expect(formatStreak({ frequency: "daily", streak_times: 5 })).toBe("5 días");
    expect(formatStreak({ frequency: "daily", streak_times: 1 })).toBe("1 día");
    expect(formatStreak({ frequency: "weekly", streak_times: 9 })).toBe("9 veces");
    expect(formatStreak({ frequency: "weekly", streak_times: 1 })).toBe("1 vez");
    expect(formatStreak({ frequency: "weekly" })).toBe("0 veces");
  });

  it("formatStreak usa current_streak si el backend no manda streak_times", () => {
    expect(formatStreak({ frequency: "daily", current_streak: 3 })).toBe("3 días");
  });

  it("formatStreakDetail: periodos cumplidos, vacío en diarios", () => {
    expect(formatStreakDetail({ frequency: "daily", streak_periods: 4 })).toBe("");
    expect(formatStreakDetail({ frequency: "weekly", streak_periods: 2 })).toBe("2 semanas cumplidas");
    expect(formatStreakDetail({ frequency: "weekly", streak_periods: 1 })).toBe("1 semana cumplida");
    expect(formatStreakDetail({ frequency: "monthly", streak_periods: 3 })).toBe("3 meses cumplidos");
    expect(formatStreakDetail({ frequency: "monthly", streak_periods: 1 })).toBe("1 mes cumplido");
  });
});

describe("describeCompletionChange", () => {
  const daily = { name: "Leer", frequency: "daily", completed_today: false };
  const weekly = { name: "Gimnasio", frequency: "weekly", completed_today: false };
  const monthly = { name: "Ahorrar", frequency: "monthly", completed_today: false };
  const noBonus = { action: "none", xp_habit: 0, xp_global: 0 };

  it("completar un diario suma XP", () => {
    const data = { record: { completed: true }, xp: { habit: 25, global: 20 }, bonus: noBonus };

    expect(describeCompletionChange(daily, data)).toEqual([
      { kind: "success", text: 'Completaste "Leer" hoy (+25 XP)' },
    ]);
  });

  it("completar un día de un semanal sin llegar a la meta", () => {
    const data = { record: { completed: true }, xp: { habit: 25, global: 20 }, bonus: noBonus };

    expect(describeCompletionChange(weekly, data)).toEqual([
      { kind: "success", text: 'Completaste "Gimnasio" hoy (+25 XP)' },
    ]);
  });

  it("al cumplir la meta avisa del bonus sin contarlo dos veces", () => {
    // El XP de la respuesta es neto: 25 del día + 37 del bonus
    const data = {
      record: { completed: true },
      xp: { habit: 62, global: 50 },
      bonus: { action: "granted", xp_habit: 37, xp_global: 30 },
    };

    expect(describeCompletionChange(weekly, data)).toEqual([
      { kind: "success", text: 'Completaste "Gimnasio" hoy (+25 XP)' },
      { kind: "bonus", text: "¡Meta semanal cumplida! Bonus +37 XP" },
    ]);
  });

  it("en un mensual el aviso habla de la meta mensual", () => {
    const data = {
      record: { completed: true },
      xp: { habit: 175, global: 140 },
      bonus: { action: "granted", xp_habit: 150, xp_global: 120 },
    };

    const messages = describeCompletionChange(monthly, data);

    expect(messages[1]).toEqual({ kind: "bonus", text: "¡Meta mensual cumplida! Bonus +150 XP" });
  });

  it("un día extra (ya pasaste la meta) explica que no da XP", () => {
    const data = { record: { completed: true }, xp: { habit: 0, global: 0 }, bonus: noBonus };

    const messages = describeCompletionChange(weekly, data);

    expect(messages).toHaveLength(1);
    expect(messages[0].kind).toBe("info");
    expect(messages[0].text).toContain("Ya cumpliste la meta de la semana");
    expect(messages[0].text).toContain("no dan XP");
  });

  it("un día extra en un mensual habla del mes", () => {
    const data = { record: { completed: true }, xp: { habit: 0, global: 0 }, bonus: noBonus };

    expect(describeCompletionChange(monthly, data)[0].text).toContain("meta del mes");
  });

  it("si el bonus se concede en un día sin XP propio no dice que la meta ya estaba cumplida", () => {
    const data = {
      record: { completed: true },
      xp: { habit: 37, global: 30 },
      bonus: { action: "granted", xp_habit: 37, xp_global: 30 },
    };

    expect(describeCompletionChange(weekly, data)).toEqual([
      { kind: "success", text: 'Completaste "Gimnasio" hoy' },
      { kind: "bonus", text: "¡Meta semanal cumplida! Bonus +37 XP" },
    ]);
  });

  it("desmarcar resta el XP del día", () => {
    const habit = { ...daily, completed_today: true };
    const data = { record: { completed: false }, xp: { habit: -25, global: -20 }, bonus: noBonus };

    expect(describeCompletionChange(habit, data)).toEqual([
      { kind: "info", text: 'Desmarcaste "Leer" (-25 XP)' },
    ]);
  });

  it("desmarcar el día que cumplía la meta avisa de que se revirtió el bonus", () => {
    const habit = { ...weekly, completed_today: true };
    const data = {
      record: { completed: false },
      xp: { habit: -62, global: -50 },
      bonus: { action: "revoked", xp_habit: 37, xp_global: 30 },
    };

    expect(describeCompletionChange(habit, data)).toEqual([
      { kind: "info", text: 'Desmarcaste "Gimnasio" (-25 XP)' },
      { kind: "info", text: "Se revirtió el bonus de la meta semanal (-37 XP)" },
    ]);
  });

  it("desmarcar un día extra no habla de XP", () => {
    const habit = { ...weekly, completed_today: true };
    const data = { record: { completed: false }, xp: { habit: 0, global: 0 }, bonus: noBonus };

    expect(describeCompletionChange(habit, data)).toEqual([
      { kind: "info", text: 'Desmarcaste "Gimnasio"' },
    ]);
  });

  it("si el estado no cambió no avisa de nada", () => {
    const habit = { ...daily, completed_today: true };
    const data = { record: { completed: true }, xp: { habit: 0, global: 0 }, bonus: noBonus };

    expect(describeCompletionChange(habit, data)).toEqual([]);
  });
});