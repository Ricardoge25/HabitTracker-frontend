import { useAuth } from "../context/AuthContext";
import HabitList from "../components/HabitList";
import { Flame, CheckCircle, Target } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Datos quemados para métricas de ejemplo
  const mockStats = {
    streak: 7,
    completedToday: 3,
    totalToday: 5, 
    monthlyProgress: 85, // en porcentaje
    daysThisMonth: 27,
    completedDays: 23,
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-950 px-6 py-8">
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-6">
        <h1 className="text-lg md:text-4xl text-indigo-400 font-mono">
          HabitTracker{" "}
        </h1>
        <h2 className="text-sm md:text-lg font-light text-white">
            Bienvenido de vuelta,{" "}
            <span className="font-semibold italic">{user?.username}</span> 👋
            <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-xs md:text-lg text-white font-semibold px-4 py-2 rounded-lg transition-colors ml-4 cursor-pointer"
        >
          Salir
        </button>
        </h2>
        
      </header>

      {/* Métricas Principales */}
      <section className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 rounded-xl p-6 shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-400 text-sm">
              Racha Actual
            </h2>
            <Flame className="text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">
            {mockStats.streak} días
          </p>
          <p className="text-gray-400 text-sm mt-2">
            ¡Sigue así!
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between ">
            <h2 className="text-gray-400 text-sm">
              Completados Hoy
            </h2>
            <CheckCircle className="text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">
            {mockStats.completedToday} / {mockStats.totalToday}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {Math.round(mockStats.completedToday / mockStats.totalToday * 100)}% Completado
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-400 text-sm">
              Meta Mensual
            </h2>
            <Target className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">
            {mockStats.monthlyProgress}%
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {mockStats.completedDays} de {mockStats.daysThisMonth} días
          </p>  
        </div>
      </section>

      {/* Lista de hábitos */}
      <HabitList />
    </div>
  );
}