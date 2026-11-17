/* global process */
// Las pruebas de fechas deben dar el mismo resultado en tu PC (Bogotá) y en el CI (UTC).
// Fijamos la zona horaria ANTES de que arranquen los workers; así corre igual en Windows, Mac y Linux.

export default function setup() {
  process.env.TZ = "America/Bogota";
}