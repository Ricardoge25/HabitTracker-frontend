import { CheckCircle, Clock, Flame } from "lucide-react";

export default function HabitCard({ habit }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-all">
      {/* Información del hábito */}
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900">
          {habit.name}
        </h3>
        <p className="text-sm text-red-600 ">
          {habit.category}
        </p>
      </div>

      {/* Métricas */}
      <div className="flex items-center gap-4">
        {/* Días Consecutivos */}
        <div className="flex items-center gap-1 text-red-700">
          <Flame size={24} />
          <span className="text-sm font-medium">{/* {habit.streak} */} 0 días</span>
        </div>

        {/* Estado de hoy */}
        {habit.completed_today ? (
          <CheckCircle className="text-green-500" size={24} />
        ) : (
          <Clock className="text-gray-400" size={24} />
        )}
      </div>
    </div>
  );
}