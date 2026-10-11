// src/features/panel/components/ChartCard.tsx

import type { ReactNode } from 'react';

interface ChartCardProps {
  readonly titulo: string;
  readonly subtitulo: string;
  readonly icono?: ReactNode;
  readonly extra?: ReactNode;
  readonly children: ReactNode;
  readonly altura?: string;
  readonly className?: string;
}

/**
 * Contenedor editorial para gráficas.
 * Mantiene consistencia visual en todos los módulos del dashboard.
 */
export function ChartCard({
  titulo, subtitulo, icono, extra, children,
  altura = 'h-72', className = '',
}: ChartCardProps) {
  return (
    <section
      className={`bg-white border border-neutral-300 flex flex-col ${className}`}
    >
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {icono}
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-neutral-950 tracking-tight truncate">
              {titulo}
            </h2>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500 truncate">
              {subtitulo}
            </p>
          </div>
        </div>
        {extra && <div className="shrink-0">{extra}</div>}
      </header>

      <div className={`${altura} w-full p-4`}>{children}</div>
    </section>
  );
}