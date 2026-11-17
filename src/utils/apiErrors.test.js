import { describe, it, expect } from "vitest";
import { extractApiError } from "./apiErrors";

describe("extractApiError", () => {
  it("sin datos devuelve el mensaje por defecto", () => {
    expect(extractApiError(null)).toMatch(/^Ocurrió un error/);
  });

  it("acepta un mensaje por defecto propio", () => {
    expect(extractApiError(undefined, "Fallo al guardar")).toBe("Fallo al guardar");
  });

  it("si los datos son una cadena, la devuelve tal cual", () => {
    expect(extractApiError("Error del servidor")).toBe("Error del servidor");
  });

  it("usa el campo detail de DRF cuando existe", () => {
    expect(extractApiError({ detail: "No encontrado." })).toBe("No encontrado.");
  });

  it("toma el primer mensaje de un error por campo", () => {
    const data = { name: ["Ya tienes un hábito con ese nombre."] };

    expect(extractApiError(data)).toBe("Ya tenes un hábito con ese nombre.");
  });

  it("con varios campos devuelve el primer mensaje del primer campo", () => {
    const data = { name: ["Mensaje A", "Mensaje B"], email: ["Mensaje C"] };

    expect(extractApiError(data)).toBe("Mensaje A");
  });

  it("un objeto vacío devuelve el mensaje por defecto", () => {
    expect(extractApiError({})).toMatch(/^Ocurrió un error/);
  });
});