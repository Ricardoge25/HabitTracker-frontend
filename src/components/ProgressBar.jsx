export const ProgressBar = ({ level, xp, xpToNext }) => {
  const progressPercent = Math.min((xp / xpToNext ) * 100, 100);

  return (
    <div className="w-full bg-gray-200 rounded-xl p-3 shadow-sm">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-semibold text-gray-800">
          Nivel {level}
        </span>
        <span className="text-sm text-gray-500">
          {xp} / {xpToNext} xp
        </span>
      </div>

      <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
          style={{width: `${progressPercent}%`}}
        ></div>
      </div>
    </div>
  );
};