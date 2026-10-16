import { Flame } from "lucide-react";

/**
 * Estructura común de Login y Register (mobile first).
 * El espaciado vertical se compacta en pantallas bajas para evitar un scroll
 * innecesario; si el contenido de verdad no cabe (p. ej. Register en móvil),
 * la página scrollea con normalidad.
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-x-hidden px-4 py-6 [@media(min-height:700px)]:py-10">
      {/* Resplandor decorativo: fijo al viewport para que NO aporte altura al documento */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-0 h-[320px] w-[420px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/20 blur-3xl sm:h-[480px] sm:w-[720px]"
      />

      <div className="relative w-full max-w-md">
        {/* Marca */}
        <div className="mb-5 text-center [@media(min-height:700px)]:mb-8">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 text-accent-soft ring-1 ring-accent/30 [@media(min-height:700px)]:mb-4 [@media(min-height:700px)]:h-12 [@media(min-height:700px)]:w-12">
            <Flame size={22} />
          </div>
          <h1 className="font-mono text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Habit <span className="text-accent-soft">Tracker</span>
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            Un 1% cada día es mejor que un 100% solo un día.
          </p>
        </div>

        {/* Tarjeta con halo violeta */}
        <div className="card card-glow p-5 [@media(min-height:700px)]:p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
          <div className="mt-4 [@media(min-height:700px)]:mt-6">{children}</div>
        </div>

        {footer && <p className="mt-5 text-center text-sm text-ink-muted">{footer}</p>}
      </div>
    </div>
  );
}