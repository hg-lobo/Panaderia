// src/features/panel/components/KpiCard.tsx

import type { ReactNode } from 'react';

type Tono = 'accent' | 'neutral' | 'rose' | 'amber';

interface KpiCardProps {
  readonly label: string;
  readonly valor: string;
  readonly delta?: number | null;
  readonly icono: ReactNode;
  readonly tono?: Tono;
  readonly sufijo?: string;
  readonly descripcion?: string;
}

const tonoValor: Record<Tono, string> = {
  accent: 'text-accent-700',
  neutral: 'text-neutral-950',
  rose: 'text-rose-700',
  amber: 'text-amber-700',
};

const tonoIcono: Record<Tono, string> = {
  accent: 'text-accent-600 border-accent-200',
  neutral: 'text-neutral-700 border-neutral-300',
  rose: 'text-rose-600 border-rose-200',
  amber: 'text-amber-600 border-amber-200',
};

const tonoBarra: Record<Tono, string> = {
  accent: 'bg-accent-600',
  neutral: 'bg-neutral-900',
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
};

export function KpiCard({
  label, valor, delta, icono, tono = 'neutral', sufijo, descripcion,
}: KpiCardProps) {
  return (
    <article className="relative isolate bg-white border border-neutral-300 p-6 hover:border-neutral-900 transition-colors">
      <div
        className={`absolute top-0 left-0 h-0.5 w-12 z-0 ${tonoBarra[tono]}`}
      />

      <header className="flex items-start justify-between mb-6 relative">
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-600">
          {label}
        </span>
        <span
          className={`h-9 w-9 border flex items-center justify-center ${tonoIcono[tono]}`}
        >
          {icono}
        </span>
      </header>

      <div className="flex items-baseline gap-2 relative">
        <p className={`text-3xl font-bold tracking-tight tabular-nums ${tonoValor[tono]}`}>
          {valor}
        </p>
        {sufijo && (
          <span className="text-xs font-medium text-neutral-500">{sufijo}</span>
        )}
      </div>

      {descripcion && (
        <p className="mt-1 text-xs text-neutral-500 relative">{descripcion}</p>
      )}

      {delta !== undefined && delta !== null && (
        <p className="mt-2 text-xs font-semibold relative">
          {delta === 999 ? (
            <span className="text-accent-700">
              <span className="tracking-wider">●</span> Primer registro
            </span>
          ) : delta === 0 ? (
            <span className="text-neutral-500">— Sin cambios</span>
          ) : delta > 0 ? (
            <span className="text-accent-700">
              ▲ {delta.toFixed(1)}%
              <span className="text-neutral-500 font-normal ml-1">
                vs. periodo anterior
              </span>
            </span>
          ) : (
            <span className="text-rose-600">
              ▼ {Math.abs(delta).toFixed(1)}%
              <span className="text-neutral-500 font-normal ml-1">
                vs. periodo anterior
              </span>
            </span>
          )}
        </p>
      )}
    </article>
  );
}