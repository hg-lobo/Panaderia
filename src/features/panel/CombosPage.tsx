// src/features/panel/CombosPage.tsx

import { Gift, Tag, Calendar, Percent, DollarSign } from 'lucide-react';
import { useCombos } from '@/infrastructure/supabase/queries/dashboard.queries';

export function CombosPage() {
  const { data: combos = [], isLoading } = useCombos();

  const fmtMoneda = (n: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(n);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 border border-neutral-300 flex items-center justify-center">
            <Gift className="h-4 w-4 text-neutral-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
              Combos y promociones
            </h2>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500">
              {combos.length} combos configurados
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-neutral-300 py-16 text-center">
          <div className="mx-auto h-6 w-6 border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
        </div>
      ) : combos.length === 0 ? (
        <div className="bg-white border border-neutral-300 py-16 text-center">
          <Gift className="mx-auto h-8 w-8 text-neutral-300 mb-3" />
          <p className="text-sm font-semibold text-neutral-700">
            Sin combos configurados
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Crea tu primer combo para aplicar descuentos automáticos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {combos.map((c) => {
            const activo = c.estado === 'ACTIVO';
            const esPorcentaje = c.tipo_descuento === 'PORCENTAJE';
            return (
              <article
                key={c.id}
                className="bg-white border border-neutral-300 p-6 hover:border-neutral-900 transition-colors"
              >
                <header className="flex items-start justify-between mb-5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border ${
                      activo
                        ? 'bg-accent-50 text-accent-800 border-accent-200'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 ${
                        activo ? 'bg-accent-500' : 'bg-neutral-400'
                      }`}
                    />
                    {c.estado}
                  </span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500">
                    {esPorcentaje ? 'Porcentaje' : 'Precio fijo'}
                  </span>
                </header>

                <h3 className="text-lg font-bold text-neutral-950 tracking-tight mb-2">
                  {c.nombre}
                </h3>
                {c.descripcion && (
                  <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                    {c.descripcion}
                  </p>
                )}

                {/* Precio / descuento destacado */}
                <div className="border-y border-neutral-200 py-4 my-4">
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-1">
                    {esPorcentaje ? 'Descuento' : 'Precio especial'}
                  </p>
                  <div className="flex items-baseline gap-2">
                    {esPorcentaje ? (
                      <Percent className="h-4 w-4 text-accent-700 self-center" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-accent-700 self-center" />
                    )}
                    <p className="text-2xl font-bold text-accent-700 tabular-nums">
                      {esPorcentaje
                        ? `${Number(c.valor_descuento)}%`
                        : fmtMoneda(Number(c.valor_descuento))}
                    </p>
                  </div>
                </div>

                {/* Items del combo */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-2">
                    Incluye
                  </p>
                  <ul className="space-y-1.5">
                    {c.items.map((it) => (
                      <li
                        key={it.producto_id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="flex items-center gap-2 text-neutral-700">
                          <Tag className="h-3 w-3 text-neutral-400" />
                          {it.producto_nombre}
                        </span>
                        <span className="font-mono font-semibold text-neutral-900">
                          ×{it.cantidad}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fechas */}
                <footer className="pt-4 border-t border-neutral-100 flex items-center gap-2 text-[10px] text-neutral-500 tracking-wide uppercase font-semibold">
                  <Calendar className="h-3 w-3" />
                  {c.fecha_fin
                    ? `Vence ${new Date(c.fecha_fin).toLocaleDateString('es-MX')}`
                    : 'Sin fecha de fin'}
                </footer>
              </article>
            );
          })}
        </div>
      )}

        {/* Nota informativa */}
        <div className="border-l-2 border-accent-600 bg-accent-50/50 px-5 py-4">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent-800 mb-1">
            Cómo funcionan los combos
        </p>
        <p className="text-xs text-accent-900 leading-relaxed">
            Los descuentos se aplican solos en el punto de venta. Cuando el cliente
            lleva todos los productos de un combo activo, el sistema detecta la
            promoción y calcula el precio especial automáticamente. No hace falta
            seleccionar nada manualmente.
        </p>
        </div>
    </div>
  );
}