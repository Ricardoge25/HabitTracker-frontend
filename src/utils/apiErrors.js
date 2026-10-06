export function extractApiError(data, fallback = "Ocurrió un error. Intenta de nuevo. ") {
  if (!data) return fallback;
  if(typeof data === "string") return data;
  if (data.detail) return data.detail;
  // DRF: { campo: ["mensaje", ...] } -> primer mensaje disponible
  return Object.values(data).flat()[0] ?? fallback;
}