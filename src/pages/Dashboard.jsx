import { useAuth } from "../context/AuthContext";
import HabitList from "../components/HabitList";
import { Flame, CheckCircle, Target } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import { ProgressBar } from "../components/ProgressBar";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [globalProgress, setGlobalProgress] = useState(null);
  const [habitStats, setHabitStats] = useState({ completed: 0, total: 0 });

  const fetchProgress = async () => {
    try {
      const res = await api.get("/progress/global/");
      setGlobalProgress(res.data);
    } catch (error) {
      toast.error("Error al obtener el progreso global");
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-black px-6 py-8">
      {/* Header */}
      <header className="w-full max-w-6xl flex items-center justify-between mb-6 px-2 sm:px-4">
        {/* Titulo */}
        <h1 className="text-xl sm:text-2xl md:text-4xl text-indigo-400 font-mono">
          HabitTracker
        </h1>
        {/* Bienvenida y botón de logout */}
        <div className="flex items-center gap-2 sm:gap-4t">
          <p className="hidden sm:block text-white text-sm md:text-lg font-light">
            Bienvenido de vuelta,{" "}
            <span className="font-semibold italic">{user?.username}</span> 👋
          </p>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors"
          >
            Salir
          </button>
        </div>
        
      </header>

      {/* Métricas Principales */}
      <section className="w-full max-w-6xl grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6">

        <div className="bg-black rounded-xl border-2 border-gray-300 p-3 sm:p-4 md:p-6 shadow transition">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm text-gray-400">
              Racha Actual
            </h2>
            <Flame className="text-orange-500 w-5 h-5" />
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2">
            {globalProgress?.current_streak ?? 0} días
          </p>
          <p className="hidden sm:block text-gray-400 text-sm mt-2">
            ¡Sigue así!
          </p>
        </div>

        <div className="bg-black rounded-xl border-2 border-gray-300 p-3 sm:p-4 md:p-6 shadow transition">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm text-gray-400">
              Hoy
            </h2>
            <CheckCircle className="text-green-500 w-5 h-5" />
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2">
            {habitStats.completed} / {habitStats.total}
          </p>
          <p className="hidden sm:block text-gray-400 text-sm mt-2">
            {habitStats.total > 0
              ? Math.round((habitStats.completed / habitStats.total) * 100)
              : 0}% Completado
          </p>

        </div>

        <div className="bg-black rounded-xl border-2 border-gray-300 p-2 sm:p-4 md:p-6 shadow transition">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm text-gray-400">
              Meta Mensual
            </h2>
            <Target className="text-blue-500 w-5 h-5"  />
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mt-2">
            {globalProgress?.monthly?.percentage ?? 0}%
          </p>
          <p className="hidden sm:block text-gray-400 text-sm mt-2">
            {globalProgress?.monthly?.completed_days ?? 0} de {globalProgress?.monthly?.days_elapsed ?? 0} días
          </p>  
        </div>
      <div className="w-full col-span-3">
        {globalProgress && (
          <div className="w-full">
            <ProgressBar
              level={globalProgress.level}
              xp={globalProgress.experience}
              xpToNext={globalProgress.xp_to_next}
            />
          </div>
        )}
      </div>
      </section>

      {/* Lista de hábitos */}
      <HabitList onProgressChange={fetchProgress} onStatsChange={setHabitStats} />
    </div>
  );
}