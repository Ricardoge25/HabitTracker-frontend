import { Link } from "react-router-dom";
import { Flame, LogOut, Tags } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * Cabecera fija. Mobile first: en pantallas pequeñas Categorías y Salir
 * muestran solo el icono y el nombre de usuario se reduce al avatar.
 */
export default function AppHeader() {
  const { user, logout } = useAuth();
  const initial = (user?.username?.[0] ?? "U").toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Marca */}
        <Link
          to="/home"
          className="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent-soft ring-1 ring-accent/30">
            <Flame size={20} />
          </span>
          <span className="font-mono text-lg font-extrabold tracking-tight text-ink">
            Habit<span className="text-accent-soft">Tracker</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Principal">
          <Link to="/categories" aria-label="Categorías" className="btn btn-secondary px-3">
            <Tags size={18} />
            <span className="hidden sm:inline">Categorías</span>
          </Link>

          {/* Usuario */}
          <div
            title={user?.username}
            className="flex items-center gap-2 rounded-full border border-line bg-surface p-1 sm:p-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent-soft">
              {initial}
            </span>
            <span className="hidden max-w-[10rem] truncate text-sm font-medium text-ink sm:block">
              {user?.username}
            </span>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            aria-label="Cerrar sesión"
            className="btn btn-secondary px-3 hover:border-danger/50 hover:text-red-300"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </nav>
      </div>
    </header>
  );
}