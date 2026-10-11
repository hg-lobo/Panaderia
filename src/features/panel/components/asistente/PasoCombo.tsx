// src/features/panel/components/asistente/PasoCombo.tsx

import { useState } from 'react';
import { Plus, Trash2, Minus, Gift } from 'lucide-react';
import type { Producto } from '@/infrastructure/types/database.types';

export interface ItemCombo {
  readonly productoId: string;
  cantidad: number;
}

export interface ConfigCombo {
  readonly nombre: string;
  readonly items: ItemCombo[];
  readonly tipoDescuento: 'PRECIO_FIJO' | 'PORCENTAJE';
  readonly valor: number;
}

interface PasoComboProps {
  readonly productos: readonly Producto[];
  readonly config: ConfigCombo;
  readonly onCambiar: (config: ConfigCombo) => void;
}

export function PasoCombo({ productos, config, onCambiar }: PasoComboProps) {
  const [productoAAgregar, setProductoAAgregar] = useState<string>('');

  const fmtMoneda = (n: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(n);

  // Productos que aún no están en el combo
  const disponibles = productos.filter(
    (p) =>
      p.activo &&
      !config.items.some((it) => it.productoId === p.id),
  );

  const agregarItem = () => {
    if (!productoAAgregar) return;
    onCambiar({
      ...config,
      items: [...config.items, { productoId: productoAAgregar, cantidad: 1 }],
    });
    setProductoAAgregar('');
  };

  const quitarItem = (productoId: string) => {
    onCambiar({
      ...config,
      items: config.items.filter((it) => it.productoId !== productoId),
    });
  };

  const cambiarCantidad = (productoId: string, delta: number) => {
    onCambiar({
      ...config,
      items: config.items
        .map((it) =>
          it.productoId === productoId
            ? { ...it, cantidad: it.cantidad + delta }
            : it,
        )
        .filter((it) => it.cantidad > 0),
    });
  };

  const infoProducto = (id: string) => productos.find((p) => p.id === id);

  // Calcular precio individual (para mostrar el ahorro)
  const precioIndividual = config.items.reduce((acc, it) => {
    const prod = infoProducto(it.productoId);
    return acc + (prod ? Number(prod.precio_venta) * it.cantidad : 0);
  }, 0);

  const precioFinal =
    config.tipoDescuento === 'PRECIO_FIJO'
      ? config.valor
      : precioIndividual * (1 - config.valor / 100);

  const ahorro = precioIndividual - precioFinal;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-neutral-950 mb-1">
          Arma tu combo
        </h3>
        <p className="text-xs text-neutral-500">
          Elige los productos que forman el combo y define el precio especial.
        </p>
      </div>

      {/* Nombre del combo */}
      <div>
        <label className="block text-xs font-semibold text-neutral-800 mb-2">
          Nombre del combo
        </label>
        <input
          type="text"
          value={config.nombre}
          onChange={(e) => onCambiar({ ...config, nombre: e.target.value })}
          placeholder="Ej. Desayuno completo"
          className="w-full border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
        />
      </div>

      {/* Productos del combo */}
      <div>
        <label className="block text-xs font-semibold text-neutral-800 mb-2">
          Productos que lleva
        </label>

        {/* Agregar producto */}
        <div className="flex gap-2 mb-3">
          <select
            value={productoAAgregar}
            onChange={(e) => setProductoAAgregar(e.target.value)}
            className="flex-1 border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
          >
            <option value="">Selecciona un producto...</option>
            {disponibles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — {fmtMoneda(Number(p.precio_venta))}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={agregarItem}
            disabled={!productoAAgregar}
            className="flex items-center gap-2 bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </button>
        </div>

        {/* Lista de items */}
        {config.items.length === 0 ? (
          <div className="border-2 border-dashed border-neutral-300 py-8 text-center">
            <Gift className="mx-auto h-6 w-6 text-neutral-300 mb-2" />
            <p className="text-xs text-neutral-500">
              Agrega al menos 2 productos para armar el combo
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {config.items.map((item) => {
              const prod = infoProducto(item.productoId);
              if (!prod) return null;
              return (
                <li
                  key={item.productoId}
                  className="flex items-center justify-between gap-3 border border-neutral-300 p-3 bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">
                      {prod.nombre}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-500">
                      {prod.sku} · {fmtMoneda(Number(prod.precio_venta))} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.productoId, -1)}
                      className="h-7 w-7 border border-neutral-300 flex items-center justify-center hover:border-neutral-900 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold tabular-nums">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.productoId, 1)}
                      className="h-7 w-7 border border-neutral-300 flex items-center justify-center hover:border-neutral-900 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => quitarItem(item.productoId)}
                    className="h-7 w-7 flex items-center justify-center text-neutral-400 hover:text-rose-600 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Tipo de descuento */}
      {config.items.length >= 2 && (
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-2">
            ¿Cómo aplicar el descuento?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                onCambiar({ ...config, tipoDescuento: 'PRECIO_FIJO' })
              }
              className={`p-4 border-2 text-left transition-all ${
                config.tipoDescuento === 'PRECIO_FIJO'
                  ? 'border-accent-600 bg-accent-50/50'
                  : 'border-neutral-300 bg-white hover:border-neutral-900'
              }`}
            >
              <p className="text-sm font-bold text-neutral-950 mb-1">
                Precio especial
              </p>
              <p className="text-xs text-neutral-600">
                El combo cuesta un precio fijo
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                onCambiar({ ...config, tipoDescuento: 'PORCENTAJE' })
              }
              className={`p-4 border-2 text-left transition-all ${
                config.tipoDescuento === 'PORCENTAJE'
                  ? 'border-accent-600 bg-accent-50/50'
                  : 'border-neutral-300 bg-white hover:border-neutral-900'
              }`}
            >
              <p className="text-sm font-bold text-neutral-950 mb-1">
                Porcentaje de descuento
              </p>
              <p className="text-xs text-neutral-600">
                Ej. 15% menos sobre el precio normal
              </p>
            </button>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-semibold text-neutral-800 mb-2">
              {config.tipoDescuento === 'PRECIO_FIJO'
                ? 'Precio del combo'
                : 'Porcentaje de descuento'}
            </label>
            <div className="relative">
              {config.tipoDescuento === 'PORCENTAJE' ? (
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={config.valor}
                  onChange={(e) =>
                    onCambiar({ ...config, valor: Number(e.target.value) })
                  }
                  className="w-full border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 pr-10"
                />
              ) : (
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={config.valor}
                  onChange={(e) =>
                    onCambiar({ ...config, valor: Number(e.target.value) })
                  }
                  className="w-full border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 pr-10"
                />
              )}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-500">
                {config.tipoDescuento === 'PORCENTAJE' ? '%' : '$'}
              </span>
            </div>
          </div>

          {/* Vista previa del ahorro */}
          <div className="mt-4 p-4 bg-stone-50 border border-neutral-200">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-3">
              Vista previa
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Precio normal</span>
                <span className="tabular-nums line-through">
                  {fmtMoneda(precioIndividual)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Precio del combo</span>
                <span className="tabular-nums font-semibold text-accent-700">
                  {fmtMoneda(precioFinal)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200">
                <span className="font-semibold text-neutral-900">
                  Ahorro para el cliente
                </span>
                <span className="tabular-nums font-bold text-accent-700">
                  {fmtMoneda(Math.max(0, ahorro))}
                </span>
              </div>
            </div>
            {ahorro <= 0 && (
              <p className="text-[10px] text-rose-600 font-semibold mt-2">
                ⚠ El precio del combo debe ser menor al precio normal
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}