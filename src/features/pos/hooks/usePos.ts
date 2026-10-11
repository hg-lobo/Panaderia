// src/features/pos/hooks/usePos.ts

import { useCallback, useEffect, useState } from 'react';
import { inferenceService } from '@/core/inference/inference.service';
import type { Hecho, ResultadoInferencia } from '@/core/inference/types';
import { useCarrito } from '../store/carrito.store';
import type { Producto } from '@/infrastructure/types/database.types';
import type { ComboConItems } from '@/infrastructure/supabase/queries/dashboard.queries';

export function usePos(
  combos: readonly ComboConItems[],
  productos: readonly Producto[],
) {
  const carrito = useCarrito();
  const [inferencia, setInferencia] = useState<ResultadoInferencia | null>(null);
  const [evaluando, setEvaluando] = useState(false);

  /**
   * Construye los hechos a partir del carrito + combos disponibles.
   * Función pura, no muta nada.
   */
  const construirHechos = useCallback(
    (
      lineas: ReadonlyArray<{ productoId: string; cantidad: number }>,
    ): Hecho[] => {
      const hechos: Hecho[] = [];

      // Hecho 1: el carrito actual
      hechos.push({
        tipo: 'carrito',
        clave: 'actual',
        valor: {
          lineas: lineas.map((l) => ({
            productoId: l.productoId,
            cantidad: l.cantidad,
          })),
        },
      });

      // Hechos 2: cada producto en el carrito
      for (const linea of lineas) {
        const producto = productos.find((p) => p.id === linea.productoId);
        if (!producto) continue;

        hechos.push({
          tipo: 'producto',
          clave: `producto:${producto.id}`,
          valor: {
            id: producto.id,
            sku: producto.sku,
            nombre: producto.nombre,
            stock: producto.stock,
            stock_minimo: producto.stock_minimo,
            fecha_vencimiento: producto.fecha_vencimiento,
            precio_venta: Number(producto.precio_venta),
            precio_costo: Number(producto.precio_costo),
          },
        });
      }

      // Hechos 3: cada combo activo con sus items y monto de descuento
      for (const combo of combos) {
        if (combo.estado !== 'ACTIVO') continue;

        const precioIndividual = combo.items.reduce((acc, item) => {
          const prod = productos.find((p) => p.id === item.producto_id);
          if (!prod) return acc;
          return acc + Number(prod.precio_venta) * item.cantidad;
        }, 0);

        const montoDescuento =
          combo.tipo_descuento === 'PRECIO_FIJO'
            ? Math.max(0, precioIndividual - Number(combo.valor_descuento))
            : precioIndividual * (Number(combo.valor_descuento) / 100);

        hechos.push({
          tipo: 'producto',
          clave: `combo:${combo.id}`,
          valor: {
            id: combo.id,
            nombre: combo.nombre,
            montoDescuento,
          },
        });

        for (const item of combo.items) {
          hechos.push({
            tipo: 'producto',
            clave: `combo_item:${combo.id}:${item.producto_id}`,
            valor: {
              productoId: item.producto_id,
              cantidad: item.cantidad,
              comboId: combo.id,
            },
          });
        }
      }

      return hechos;
    },
    [combos, productos],
  );

  /**
   * Ejecuta el motor sobre el estado actual del carrito.
   * SOLO LEE. No escribe al store.
   */
  const evaluar = useCallback(async (): Promise<ResultadoInferencia> => {
    setEvaluando(true);
    try {
      const snapshot = carrito.lineas.map((l) => ({
        productoId: l.productoId,
        cantidad: l.cantidad,
      }));
      const hechos = construirHechos(snapshot);
      const resultado = await inferenceService.inferir(hechos);
      setInferencia(resultado);
      return resultado;
    } finally {
      setEvaluando(false);
    }
  }, [carrito.lineas, construirHechos]);

  /**
   * Efecto derivado: cuando cambian las líneas del carrito, reevaluamos
   * el motor. Sin setTimeout, sin race conditions, sin tocar el store.
   *
   * Nota: si el carrito está vacío, no hacemos setInferencia(null) — el
   * cálculo derivado de descuentos ya maneja ese caso (usa ?? 0).
   */
  useEffect(() => {
    if (carrito.lineas.length === 0) return;

    let cancelado = false;

    inferenceService
      .inferir(construirHechos(carrito.lineas))
      .then((resultado) => {
        if (!cancelado) setInferencia(resultado);
      })
      .catch((err) => {
        console.error('Error del motor:', err);
      });

    return () => {
      cancelado = true;
    };
  }, [carrito.lineas, construirHechos]);

  /**
   * Totales derivados: usan inferencia para el descuento, pero NO
   * modifican el carrito.
   */
  const subtotal = carrito.lineas.reduce(
    (acc, l) => acc + l.precioUnitario * l.cantidad,
    0,
  );
  const descuentos = carrito.lineas.length === 0
    ? 0
    : inferencia?.descuentoTotal ?? 0;
  const total = Math.max(0, subtotal - descuentos);

  return {
    lineas: carrito.lineas,
    agregar: carrito.agregar,
    quitar: carrito.quitar,
    cambiarCantidad: carrito.cambiarCantidad,
    limpiar: carrito.limpiar,
    evaluar,
    inferencia,
    evaluando,
    totales: { subtotal, descuentos, total },
  };
}