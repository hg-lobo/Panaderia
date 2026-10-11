// src/features/panel/NotFoundPage.tsx

import { ArrowLeft, Home } from 'lucide-react';

interface NotFoundPageProps {
  readonly rutaIntentada?: string;
  readonly onVolver?: () => void;
}

/**
 * Página 404 dentro del panel.
 * Se muestra cuando el usuario intenta navegar a una ruta inexistente.
 */
export function NotFoundPage({ rutaIntentada, onVolver }: NotFoundPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="max-w-lg w-full">
        {/* Código grande editorial */}
        <div className="flex items-baseline gap-4 mb-8">
          <p className="text-8xl md:text-9xl font-bold text-neutral-950 tracking-tighter leading-none">
            404
          </p>
          <div className="flex-1 border-t border-neutral-300 mt-8" />
        </div>

        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent-700 mb-3">
          Ruta no encontrada
        </p>

        <h1 className="text-2xl md:text-3xl font-bold text-neutral-950 tracking-tight mb-4">
          Esta página no existe.
        </h1>

        <p className="text-sm text-neutral-600 leading-relaxed mb-8">
          La sección que buscas fue movida, eliminada o nunca existió. Verifica
          la URL o regresa al panel principal.
        </p>

        {rutaIntentada && (
          <div className="border-l-2 border-neutral-300 pl-4 mb-8">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-1">
              Ruta intentada
            </p>
            <p className="text-xs font-mono text-neutral-700 break-all">
              {rutaIntentada}
            </p>
          </div>
        )}

        {onVolver && (
          <div className="flex items-center gap-3">
            <button
              onClick={onVolver}
              className="flex items-center gap-2 bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-accent-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              Volver al dashboard
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-950 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Atrás
            </button>
          </div>
        )}
      </div>
    </div>
  );
}