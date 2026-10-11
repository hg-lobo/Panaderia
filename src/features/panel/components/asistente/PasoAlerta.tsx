// src/features/panel/components/asistente/PasoAlerta.tsx

import { AlertTriangle, Package } from 'lucide-react';
import type { TipoAccion } from './PasoAccion';

export interface ConfigAlerta {
  readonly nivel: 'ROJO' | 'AMARILLO' | 'VERDE';
  readonly mensaje: string;
  readonly umbralDias?: number;
  readonly umbralStock?: number;
}

interface PasoAlertaProps {
  readonly tipo: Extract<TipoAccion, 'alerta_vencimiento' | 'alerta_stock'>;
  readonly config: ConfigAlerta;
  readonly onCambiar: (config: ConfigAlerta) => void;
}

export function PasoAlerta({ tipo, config, onCambiar }: PasoAlertaProps) {
  const esVencimiento = tipo === 'alerta_vencimiento';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-neutral-950 mb-1">
          {esVencimiento
            ? 'Configurar alerta de vencimiento'
            : 'Configurar alerta de stock bajo'}
        </h3>
        <p className="text-xs text-neutral-500">
          {esVencimiento
            ? 'El sistema avisará cuando un producto esté próximo a vencer.'
            : 'El sistema avisará cuando un producto esté por agotarse.'}
        </p>
      </div>

      {/* Umbral */}
      <div>
        <label className="block text-xs font-semibold text-neutral-800 mb-2">
          {esVencimiento
            ? 'Avisar cuando falten (días) para vencer'
            : 'Avisar cuando queden (unidades)'}
        </label>
        <div className="relative">
          <input
            type="number"
            min={1}
            value={
              esVencimiento
                ? config.umbralDias ?? 7
                : config.umbralStock ?? 5
            }
            onChange={(e) => {
              const valor = Number(e.target.value);
              onCambiar(
                esVencimiento
                  ? { ...config, umbralDias: valor }
                  : { ...config, umbralStock: valor },
              );
            }}
            className="w-full border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 pr-24"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-500">
            {esVencimiento ? 'días o menos' : 'unidades o menos'}
          </span>
        </div>
      </div>

      {/* Nivel */}
      <div>
        <label className="block text-xs font-semibold text-neutral-800 mb-2">
          Nivel de urgencia
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              {
                valor: 'AMARILLO' as const,
                titulo: 'Informativo',
                color: 'border-amber-300 bg-amber-50/50 text-amber-800',
              },
              {
                valor: 'ROJO' as const,
                titulo: 'Crítico',
                color: 'border-rose-300 bg-rose-50/50 text-rose-800',
              },
              {
                valor: 'VERDE' as const,
                titulo: 'Suave',
                color: 'border-accent-300 bg-accent-50/50 text-accent-800',
              },
            ]
          ).map((op) => (
            <button
              key={op.valor}
              type="button"
              onClick={() => onCambiar({ ...config, nivel: op.valor })}
              className={`p-3 border-2 text-center transition-all ${
                config.nivel === op.valor
                  ? op.color
                  : 'border-neutral-300 bg-white hover:border-neutral-900'
              }`}
            >
              <p className="text-xs font-bold">{op.titulo}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Mensaje */}
      <div>
        <label className="block text-xs font-semibold text-neutral-800 mb-2">
          Mensaje que verá el cajero
        </label>
        <input
          type="text"
          value={config.mensaje}
          onChange={(e) => onCambiar({ ...config, mensaje: e.target.value })}
          placeholder={
            esVencimiento
              ? 'Ej. Producto vence pronto, revisar'
              : 'Ej. Stock bajo, reabastecer'
          }
          className="w-full border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
        />
        <p className="mt-1 text-[10px] text-neutral-500">
          Sé claro y directo. El cajero lo verá en el punto de venta.
        </p>
      </div>

      {/* Vista previa */}
      <div className="p-4 bg-stone-50 border border-neutral-200">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-3">
          Vista previa de la alerta
        </p>
        <div
          className={`flex items-start gap-2 border-l-2 px-3 py-2 text-xs font-medium ${
            config.nivel === 'ROJO'
              ? 'border-rose-400 bg-rose-50 text-rose-900'
              : config.nivel === 'AMARILLO'
                ? 'border-amber-400 bg-amber-50 text-amber-900'
                : 'border-accent-400 bg-accent-50 text-accent-900'
          }`}
        >
          {esVencimiento ? (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          ) : (
            <Package className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          )}
          <span>{config.mensaje || 'Mensaje de la alerta'}</span>
        </div>
      </div>
    </div>
  );
}