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
    <div className="flex flex-col items-center min-h-screen bg-black px-6 py-8">
      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row md:justify-between md:items-center mb-6 px-4">
        {/* Titulo */}
        <h1 className="text-2xl md:text-4xl text-indigo-400 font-mono mb-2 md:mb-0 text-center md:text-left">
          HabitTracker
        </h1>
        {/* Bienvenida y botón de logout */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-white text-sm md:text-lg font-light">
          <p className="text-center sm:text-left">
            Bienvenido de vuelta,{" "}
            <span className="font-semibold italic">{user?.username}</span> 👋
          </p>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-xs md:text-sm text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Salir
          </button>
        </div>
        
      </header>

      {/* Métricas Principales */}
      <section className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">

        <div className="bg-black rounded-xl border-2 border-gray-300 p-4 md:p-6 shadow transition">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-400 text-xs md:text-sm">
              Racha Actual
            </h2>
            <Flame className="text-orange-500" />
          </div>
          <p className="text-lg md:text-3xl font-bold text-white mt-2">
            {mockStats.streak} días
          </p>
          <p className="text-gray-400 text-sm mt-2">
            ¡Sigue así!
          </p>
        </div>

        <div className="bg-black rounded-xl border-2 border-gray-300 p-4 md:p-6 shadow  transition">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-400 text-xs md:text-sm">
              Completados Hoy
            </h2>
            <CheckCircle className="text-green-500" />
          </div>
          <p className="text-lg md:text-3xl font-bold text-white mt-2">
            {mockStats.completedToday} / {mockStats.totalToday}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {Math.round(mockStats.completedToday / mockStats.totalToday * 100)}% Completado
          </p>
        </div>

        <div className="bg-black rounded-xl border-2 border-gray-300 p-6 shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-400 text-xs md:text-sm">
              Meta Mensual
            </h2>
            <Target className="text-blue-500"  />
          </div>
          <p className="text-lg md:text-3xl font-bold text-white mt-2">
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