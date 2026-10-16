import { useCallback, useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Flame, Target } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useNow } from "../hooks/useNow";
import AppHeader from "../components/AppHeader";
import HabitList from "../components/HabitList";
import StatCard from "../components/StatCard";
import { ProgressBar } from "../components/ProgressBar";

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

function greetingFor(hour) {
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

// Componente aparte A PROPÓSITO: el reloj se actualiza cada pocos segundos y,
// al estar aislado, solo se re-renderiza este bloque y no toda la página.
function Greeting({ username }) {
  const now = useNow();

  const date = capitalize(
    now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })
  );
  const time = now.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });

  return (
    <section className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        {greetingFor(now.getHours())}, <span className="text-accent-soft">{username}</span>
      </h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={16} className="text-ink-faint" /> {date}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock size={16} className="text-ink-faint" /> {time}
        </span>
      </p>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [globalProgress, setGlobalProgress] = useState(null);
  const [habitStats, setHabitStats] = useState({ completed: 0, total: 0 });

  const fetchProgress = useCallback(async () => {
    try {
      const res = await api.get("/progress/global/");
      setGlobalProgress(res.data);
    } catch (error) {
      toast.error("Error al obtener el progreso global");
      console.error("Error al obtener el progreso global", error);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const todayPercent =
    habitStats.total > 0 ? Math.round((habitStats.completed / habitStats.total) * 100) : 0;
  const monthly = globalProgress?.monthly;
  const monthlyPercent = Math.round(monthly?.percentage ?? 0);

  return (
    <div className="min-h-dvh">
      <AppHeader />

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <Greeting username={user?.username} />

        {/* Métricas: 3 columnas también en móvil, por eso son compactas */}
        <section aria-label="Resumen" className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <StatCard
            icon={Flame}
            tone="warning"
            label="Racha"
            value={globalProgress?.current_streak ?? 0}
            unit="días"
            hint="¡Sigue así!"
          />
          <StatCard
            icon={CheckCircle2}
            tone="success"
            label="Hoy"
            value={`${habitStats.completed}/${habitStats.total}`}
            progress={todayPercent}
            hint={`${todayPercent}% completado`}
          />
          <StatCard
            icon={Target}
            tone="accent"
            label="Meta mensual"
            value={`${monthlyPercent}%`}
            progress={monthlyPercent}
            hint={`${monthly?.completed_days ?? 0} de ${monthly?.days_elapsed ?? 0} días`}
          />
        </section>

        {globalProgress && (
          <div className="mt-2.5 sm:mt-4">
            <ProgressBar
              level={globalProgress.level}
              xp={globalProgress.experience}
              xpToNext={globalProgress.xp_to_next}
            />
          </div>
        )}

        <div className="mt-8">
          <HabitList onProgressChange={fetchProgress} onStatsChange={setHabitStats} />
        </div>
      </main>
    </div>
  );
}