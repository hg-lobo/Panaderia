// src/features/panel/components/asistente/PasoRevision.tsx

import { Check, Sparkles } from 'lucide-react';
import type { ConfigCombo } from './PasoCombo';
import type { ConfigAlerta } from './PasoAlerta';
import type { TipoAccion } from './PasoAccion';
import type { Producto } from '@/infrastructure/types/database.types';

interface PasoRevisionProps {
  readonly tipo: TipoAccion;
  readonly nombre: string;
  readonly prioridad: number;
  readonly configCombo?: ConfigCombo;
  readonly configAlerta?: ConfigAlerta;
  readonly productos: readonly Producto[];
}

export function PasoRevision({
  tipo, nombre, prioridad, configCombo, configAlerta, productos,
}: PasoRevisionProps) {
  const fmtMoneda = (n: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(n);

  const generarResumen = (): string => {
    if (tipo === 'descuento_combo' && configCombo) {
      const nombres = configCombo.items
        .map((it) => {
          const p = productos.find((x) => x.id === it.productoId);
          return p ? `${it.cantidad}× ${p.nombre}` : '';
        })
        .filter(Boolean)
        .join(' + ');
      const desc =
        configCombo.tipoDescuento === 'PRECIO_FIJO'
          ? `por ${fmtMoneda(configCombo.valor)}`
          : `con ${configCombo.valor}% de descuento`;
      return `Cuando el cliente lleve ${nombres}, aplicar el precio del combo ${desc}.`;
    }

    if (tipo === 'alerta_vencimiento' && configAlerta) {
      const nivelTxt =
        configAlerta.nivel === 'ROJO'
          ? 'crítica'
          : configAlerta.nivel === 'AMARILLO'
            ? 'importante'
            : 'informativa';
      return `Cuando un producto venza en ${configAlerta.umbralDias ?? 7} días o menos, mostrar una alerta ${nivelTxt}: "${configAlerta.mensaje}".`;
    }

    if (tipo === 'alerta_stock' && configAlerta) {
      const nivelTxt =
        configAlerta.nivel === 'ROJO'
          ? 'crítica'
          : configAlerta.nivel === 'AMARILLO'
            ? 'importante'
            : 'informativa';
      return `Cuando el stock de un producto sea ${configAlerta.umbralStock ?? 5} unidades o menos, mostrar una alerta ${nivelTxt}: "${configAlerta.mensaje}".`;
    }

    if (tipo === 'bloquear_venta') {
      return `Bloquear la venta cuando un producto no tenga stock disponible.`;
    }

    return 'Regla configurada.';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-neutral-950 mb-1">
          Revisa tu regla
        </h3>
        <p className="text-xs text-neutral-500">
          Confirma que todo esté correcto antes de crearla.
        </p>
      </div>

      {/* Resumen principal */}
      <div className="border-l-2 border-accent-600 bg-accent-50/50 px-5 py-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-accent-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent-800 mb-1">
              Esto es lo que hará tu regla
            </p>
            <p className="text-sm text-neutral-900 leading-relaxed font-medium">
              {generarResumen()}
            </p>
          </div>
        </div>
      </div>

      {/* Detalles */}
      <div className="bg-white border border-neutral-300">
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Nombre
            </span>
            <span className="text-sm font-semibold text-neutral-900 text-right">
              {nombre}
            </span>
          </div>

          <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Prioridad
            </span>
            <span className="text-sm font-semibold text-neutral-900">
              {prioridad}
            </span>
          </div>

          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Estado al crear
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-700">
              <Check className="h-3.5 w-3.5" />
              Activa
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-neutral-500 text-center">
        Podrás editar o desactivar esta regla en cualquier momento.
      </p>
    </div>
  );
}