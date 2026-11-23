import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { endSession, revokeRefreshToken } from "./auth";

// Simulamos axios: estos tests no deben hacer peticiones reales
vi.mock("axios", () => ({ default: { post: vi.fn() } }));

describe("revokeRefreshToken", () => {
  beforeEach(() => {
    axios.post.mockReset();
  });

  it("sin refresh token no llama al servidor y devuelve false", async () => {
    for (const refresh of [null, undefined, ""]) {
      await expect(revokeRefreshToken(refresh)).resolves.toBe(false);
    }
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("envía el refresh al endpoint de blacklist con un timeout corto", async () => {
    axios.post.mockResolvedValue({ status: 200 });

    await revokeRefreshToken("abc");

    expect(axios.post).toHaveBeenCalledTimes(1);
    const [url, body, config] = axios.post.mock.calls[0];
    expect(url).toMatch(/token\/blacklist\/$/);
    expect(body).toEqual({ refresh: "abc" });
    expect(config.timeout).toBeGreaterThan(0);
    expect(config.timeout).toBeLessThanOrEqual(10000);
  });

  it("devuelve true si el servidor revoca el token", async () => {
    axios.post.mockResolvedValue({ status: 200 });

    await expect(revokeRefreshToken("abc")).resolves.toBe(true);
  });

  it("nunca rechaza si falla la red: devuelve false", async () => {
    axios.post.mockRejectedValue(new Error("Network Error"));

    await expect(revokeRefreshToken("abc")).resolves.toBe(false);
  });

  it("nunca rechaza si el token ya estaba revocado o caducado (401)", async () => {
    axios.post.mockRejectedValue({ response: { status: 401 } });

    await expect(revokeRefreshToken("abc")).resolves.toBe(false);
  });

  it("nunca rechaza si se agota el timeout", async () => {
    axios.post.mockRejectedValue({ code: "ECONNABORTED" });

    await expect(revokeRefreshToken("abc")).resolves.toBe(false);
  });
});

// localStorage mínimo en memoria: el entorno de los tests es "node" (sin navegador)
function createMemoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

describe("endSession", () => {
  beforeEach(() => {
    axios.post.mockReset();
    vi.stubGlobal(
      "localStorage",
      createMemoryStorage({
        access: "acc",
        refresh: "ref-123",
        username: "ana",
        lastActivity: "1",
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("revoca el refresh que había ANTES de limpiar el almacenamiento", () => {
    axios.post.mockResolvedValue({ status: 200 });

    endSession();

    const [, body] = axios.post.mock.calls[0];
    expect(body).toEqual({ refresh: "ref-123" });
  });

  it("limpia la sesión al instante, sin esperar al servidor", () => {
    // Una promesa que nunca se resuelve: como un servidor que no responde
    axios.post.mockReturnValue(new Promise(() => {}));

    endSession();

    for (const key of ["access", "refresh", "username", "lastActivity"]) {
      expect(localStorage.getItem(key)).toBeNull();
    }
  });

  it("sin sesión guardada no hace ninguna petición", () => {
    vi.stubGlobal("localStorage", createMemoryStorage());

    endSession();

    expect(axios.post).not.toHaveBeenCalled();
  });
});