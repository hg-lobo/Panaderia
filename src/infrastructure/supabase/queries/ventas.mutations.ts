// src/infrastructure/supabase/queries/ventas.mutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { LineaCarrito } from '@/features/pos/store/carrito.store';
import type { ReglaDisparada } from '@/core/inference/types';

export interface CheckoutPayload {
  readonly cajero_id: string;
  readonly subtotal: number;
  readonly descuentos: number;
  readonly total: number;
  readonly lineas: ReadonlyArray<LineaCarrito>;
  readonly inferencias: ReadonlyArray<ReglaDisparada>;
}

export interface CheckoutResult {
  readonly venta_id: string;
  readonly numero_factura: string;
  readonly total: number;
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CheckoutPayload): Promise<CheckoutResult> => {
        // Distribuir el descuento total proporcionalmente entre las líneas
        const subtotalBruto = payload.lineas.reduce(
        (acc, l) => acc + l.precioUnitario * l.cantidad,
        0,
        );
        const factorDescuento =
        subtotalBruto > 0 ? payload.descuentos / subtotalBruto : 0;

        const lineasJson = payload.lineas.map((l) => {
        const brutoLinea = l.precioUnitario * l.cantidad;
        const descuentoLinea = +(brutoLinea * factorDescuento).toFixed(2);
        return {
            producto_id: l.productoId,
            cantidad: l.cantidad,
            precio_unitario: l.precioUnitario,
            precio_costo_unitario: l.precioCostoUnitario,
            descuento_linea: descuentoLinea,
            subtotal_linea: +(brutoLinea - descuentoLinea).toFixed(2),
            combo_id: null,
        };
        });

      const inferenciasJson = payload.inferencias.map((d) => ({
        regla_id: d.regla.id,
        regla_codigo: d.regla.codigo,
        hechos_entrada: d.hechosEntrada,
        hechos_salida: d.hechosSalida,
        justificacion: d.justificacion,
      }));

      const { data, error } = await supabase.rpc('fn_registrar_venta', {
        payload: {
          cajero_id: payload.cajero_id,
          subtotal: payload.subtotal,
          descuentos: payload.descuentos,
          total: payload.total,
          lineas: lineasJson,
          inferencias: inferenciasJson,
        },
      });

      if (error) throw new Error(error.message);
      return data as CheckoutResult;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] });
      qc.invalidateQueries({ queryKey: ['ventas-recientes'] });
      qc.invalidateQueries({ queryKey: ['ventas-por-dia'] });
      qc.invalidateQueries({ queryKey: ['kpis'] });
      qc.invalidateQueries({ queryKey: ['vencimientos'] });
    },
  });
}