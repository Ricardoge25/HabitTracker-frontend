// Las clases se escriben completas (no se construyen con plantillas) para que
// Tailwind las detecte al compilar.
const TONES = {
  warning: { icon: "bg-warning/15 text-warning", bar: "bg-warning" },
  success: { icon: "bg-success/15 text-success", bar: "bg-success" },
  accent: { icon: "bg-accent/15 text-accent-soft", bar: "bg-accent" },
};

/**
 * Métrica compacta: icono, valor, etiqueta y (opcional) barra de progreso.
 * El texto de apoyo (`hint`) solo aparece desde `sm` para no saturar el móvil.
 */
export default function StatCard({ icon: Icon, label, value, unit, hint, progress = null, tone = "accent" }) {
  const t = TONES[tone];

  return (
    <div className="card flex flex-col justify-between gap-3 p-3 sm:p-5">
      <div>
        <span className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${t.icon}`}>
          <Icon size={18} />
        </span>
        <p className="text-2xl font-bold leading-none text-ink sm:text-3xl">
          {value}
          {unit && <span className="ml-1 text-xs font-medium text-ink-muted sm:text-sm">{unit}</span>}
        </p>
        <p className="mt-1.5 text-xs font-medium text-ink-muted sm:text-sm">{label}</p>
      </div>

      <div>
        {progress !== null && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${t.bar}`}
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        )}
        {hint && <p className="mt-2 hidden text-xs text-ink-faint sm:block">{hint}</p>}
      </div>
    </div>
  );
}