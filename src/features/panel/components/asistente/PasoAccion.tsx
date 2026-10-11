// src/features/panel/components/asistente/PasoAccion.tsx

import { Gift, AlertTriangle, Ban, TrendingUp } from 'lucide-react';

export type TipoAccion =
  | 'descuento_combo'
  | 'alerta_vencimiento'
  | 'alerta_stock'
  | 'bloquear_venta';

interface OpcionAccion {
  readonly tipo: TipoAccion;
  readonly titulo: string;
  readonly descripcion: string;
  readonly ejemplo: string;
  readonly icono: React.ReactNode;
}

const OPCIONES: OpcionAccion[] = [
  {
    tipo: 'descuento_combo',
    titulo: 'Aplicar descuento por combo',
    descripcion: 'Cuando el cliente lleva ciertos productos juntos, aplicar un precio especial.',
    ejemplo: 'Café + Concha por $30 en vez de $40',
    icono: <Gift className="h-5 w-5" />,
  },
  {
    tipo: 'alerta_vencimiento',
    titulo: 'Avisar de productos por vencer',
    descripcion: 'El sistema te muestra una alerta cuando un producto está próximo a caducar.',
    ejemplo: 'Avisar cuando falten 7 días para que venza',
    icono: <AlertTriangle className="h-5 w-5" />,
  },
  {
    tipo: 'alerta_stock',
    titulo: 'Avisar cuando queda poco stock',
    descripcion: 'El sistema te alerta cuando un producto está por agotarse.',
    ejemplo: 'Avisar cuando queden 5 unidades o menos',
    icono: <TrendingUp className="h-5 w-5" />,
  },
  {
    tipo: 'bloquear_venta',
    titulo: 'Bloquear una venta',
    descripcion: 'Impedir vender cuando se cumple una condición.',
    ejemplo: 'No vender productos sin stock',
    icono: <Ban className="h-5 w-5" />,
  },
];

interface PasoAccionProps {
  readonly seleccionado: TipoAccion | null;
  readonly onSeleccionar: (tipo: TipoAccion) => void;
}

export function PasoAccion({ seleccionado, onSeleccionar }: PasoAccionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-neutral-950 mb-1">
          ¿Qué quieres que haga el sistema?
        </h3>
        <p className="text-xs text-neutral-500">
          Elige una acción. Te guiaremos paso a paso para configurarla.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {OPCIONES.map((op) => {
          const activa = seleccionado === op.tipo;
          return (
            <button
              key={op.tipo}
              onClick={() => onSeleccionar(op.tipo)}
              className={`text-left p-5 border-2 transition-all ${
                activa
                  ? 'border-accent-600 bg-accent-50/50'
                  : 'border-neutral-300 bg-white hover:border-neutral-900'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span
                  className={`h-10 w-10 flex items-center justify-center border shrink-0 ${
                    activa
                      ? 'border-accent-600 bg-accent-600 text-white'
                      : 'border-neutral-300 text-neutral-700'
                  }`}
                >
                  {op.icono}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-950 leading-tight">
                    {op.titulo}
                  </p>
                </div>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed mb-2">
                {op.descripcion}
              </p>
              <p className="text-[10px] font-mono text-neutral-400 italic">
                Ej: {op.ejemplo}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}