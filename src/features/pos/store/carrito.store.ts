// src/features/pos/store/carrito.store.ts

import { create } from 'zustand';
import type { Producto } from '@/infrastructure/types/database.types';

export interface LineaCarrito {
  readonly productoId: string;
  readonly sku: string;
  readonly nombre: string;
  readonly precioUnitario: number;
  readonly precioCostoUnitario: number;
  cantidad: number;
}

interface CarritoState {
  lineas: LineaCarrito[];
  agregar: (producto: Producto, cantidad?: number) => void;
  quitar: (productoId: string) => void;
  cambiarCantidad: (productoId: string, cantidad: number) => void;
  limpiar: () => void;
}

/**
 * Store del carrito. Solo se modifica cuando el usuario hace una acción
 * explícita (agregar, quitar, cambiar cantidad). El motor de inferencia
 * es 100% de lectura — no toca este estado.
 */
export const useCarrito = create<CarritoState>((set) => ({
  lineas: [],

  agregar: (producto, cantidad = 1) =>
    set((state) => {
      const existente = state.lineas.find(
        (l) => l.productoId === producto.id,
      );
      if (existente) {
        return {
          lineas: state.lineas.map((l) =>
            l.productoId === producto.id
              ? { ...l, cantidad: l.cantidad + cantidad }
              : l,
          ),
        };
      }
      const nueva: LineaCarrito = {
        productoId: producto.id,
        sku: producto.sku,
        nombre: producto.nombre,
        precioUnitario: Number(producto.precio_venta),
        precioCostoUnitario: Number(producto.precio_costo),
        cantidad,
      };
      return { lineas: [...state.lineas, nueva] };
    }),

  quitar: (productoId) =>
    set((state) => ({
      lineas: state.lineas.filter((l) => l.productoId !== productoId),
    })),

  cambiarCantidad: (productoId, cantidad) =>
    set((state) => ({
      lineas: state.lineas
        .map((l) => (l.productoId === productoId ? { ...l, cantidad } : l))
        .filter((l) => l.cantidad > 0),
    })),

  limpiar: () => set({ lineas: [] }),
}));

/** Cálculos derivados — no dependen de inferencias */
export function calcularTotales(lineas: readonly LineaCarrito[]) {
  const subtotal = lineas.reduce(
    (acc, l) => acc + l.precioUnitario * l.cantidad,
    0,
  );
  return { subtotal, total: subtotal };
}