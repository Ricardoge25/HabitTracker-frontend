export const ProgressBar = ({ level, xp, xpToNext }) => {
  const percent = xpToNext > 0 ? Math.min((xp / xpToNext) * 100, 100) : 0;
  const remaining = Math.max(xpToNext - xp, 0);

  return (
    <div className="card flex items-center gap-4 p-4 sm:p-5">
      {/* Insignia de nivel */}
      <div
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-accent/15 ring-1 ring-accent/30 sm:h-14 sm:w-14"
      >
        <span className="text-[10px] font-semibold uppercase leading-none text-accent-soft">Nivel</span>
        <span className="text-xl font-bold leading-tight text-ink sm:text-2xl">{level}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-ink">Nivel {level}</p>
          <p className="text-xs text-ink-muted">
            {xp} / {xpToNext} XP
          </p>
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={xpToNext}
          aria-valuenow={xp}
          aria-label="Experiencia hacia el siguiente nivel"
          className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-soft transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-ink-faint">
          Te faltan {remaining} XP para el nivel {level + 1}
        </p>
      </div>
    </div>
  );
};