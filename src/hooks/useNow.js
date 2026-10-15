import { useEffect, useState } from "react";

// Devuelve la fecha actual y se actualiza cada `intervalMs`.
export function useNow(intervalMs = 15000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}