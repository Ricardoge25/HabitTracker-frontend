import { describe, it, expect } from "vitest";
import { getLastSevenDays, lightenColor } from "./habitUtils";

describe("getLastSevenDays", () => {
  it("devuelve 7 días terminando hy, con la letra de cada día", () => {
    const today = new Date(2026, 10, 6); // viernes 6-nov-2026 (los meses van de 0 a 11)

    const days = getLastSevenDays(today); 

    expect(days.map((d) => d.label)).toEqual(["S", "D", "L", "M", "X", "J", "V"]);
  });

  it("marca solo el último día como hoy", () => {
    const days = getLastSevenDays(new Date(2026, 10, 6));

    expect(days.map((d) => d.isToday)).toEqual([false, false, false, false, false, false, true]);
  });

  it("cruza el cambio de año", () => {
    const days = getLastSevenDays(new Date(2027, 0, 2)); // sábado 2-ene-2027

    expect(days.map((d) => d.label)).toEqual(["D", "L", "M", "X", "J", "V", "S"]);
  });

  it("no modifica la fecha recibida", () => {
    const today = new Date(2026, 10, 6);

    getLastSevenDays(today);

    expect(today.getDate()).toBe(6);
    expect(today.getMonth()).toBe(10);
  });

  it("da el nombre del día en español", () => {
    const days = getLastSevenDays(new Date(2026, 10, 6));

    expect(days[0].name).toBe("sábado");
    expect(days[6].name).toBe("viernes");
  });
});

describe("lightenColor", () => {
  it("aclara un color sumándole blanco", () => {
    expect(lightenColor("#000000", 0.5)).toBe("rgb(128, 128, 128");
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