import { useCallback, useEffect, useRef, useState } from "react";
import {
  IDLE_TIMEOUT_MS,
  WARNING_MS,
  getLastActivity,
  touchActivity,
} from "../utils/session";

// Interacciones que cuentan como "el usuario está aquí".
// scroll no se propaga (bubbling), así que se escucha en fase de captura para
// detectar el scroll de CUALQUIER elemento, no solo el de la ventana.
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

// mousemove se dispara decenas de veces por segundo. Escribir en localStorage cada vez
// sería un desperdicio: como mucho una vez cada 5 s.
const WRITE_THROTTLE_MS = 5000;

/**
 * Vigila la inactividad.
 * @param {{ onTimeout: () => void }} options  se llama cuando se agota el tiempo.
 * @returns {{ secondsLeft: number|null, stayActive: () => void }}
 *   secondsLeft es null mientras no haya que avisar; luego, los segundos restantes.
 */
export function useIdleSession({ onTimeout }) {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const warningVisible = useRef(false); // espejo de secondsLeft para leerlo dentro de listeners
  const lastWrite = useRef(0);

  // Siempre llamamos a la ÚLTIMA versión de onTimeout sin tener que
  // reinstalar los listeners cada vez que cambie
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  // Botón "Seguir conectado"
  const stayActive = useCallback(() => {
    touchActivity();
    warningVisible.current = false;
    setSecondsLeft(null);
  }, []);

  useEffect(() => {
    // Sesiones iniciadas antes de este cambio no tienen marca: la creamos
    if (getLastActivity() === null) touchActivity();

    const onActivity = () => {
      // Con el aviso en pantalla, mover el ratón NO cuenta: el usuario debe confirmar
      // con el botón, o el diálogo desaparecería al rozar el ratón.
      if (warningVisible.current) return;
      const now = Date.now();
      if (now - lastWrite.current < WRITE_THROTTLE_MS) return;
      lastWrite.current = now;
      touchActivity();
    };

    // Se ejecuta cada segundo. Compara con la hora REAL, así funciona tras suspender
    // el equipo y con la actividad de otras pestañas (leen la misma marca).
    const check = () => {
      const last = getLastActivity() ?? Date.now();
      const remaining = IDLE_TIMEOUT_MS - (Date.now() - last);

      if (remaining <= 0) {
        onTimeoutRef.current();
      } else if (remaining <= WARNING_MS) {
        warningVisible.current = true;
        setSecondsLeft(Math.ceil(remaining / 1000));
      } else if (warningVisible.current) {
        // Otra pestaña registró actividad: ya no hace falta avisar aquí
        warningVisible.current = false;
        setSecondsLeft(null);
      }
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true, capture: true })
    );
    check(); // comprobación inmediata (por si volvemos tras una pausa larga)
    const intervalId = setInterval(check, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, onActivity, { capture: true })
      );
      clearInterval(intervalId);
    };
  }, []);

  return { secondsLeft, stayActive };
}