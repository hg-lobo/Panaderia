// src/infrastructure/supabase/queries/devoluciones.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';

export interface DetalleConProducto {
  readonly id: string;
  readonly producto_id: string;
  readonly producto_nombre: string;
  readonly cantidad: number;
  readonly precio_unitario: number;
  readonly subtotal_linea: number;
}

export interface VentaConDetalle {
  readonly id: string;
  readonly numero_factura: string;
  readonly total: number;
  readonly estado: string;
  readonly created_at: string;
  readonly detalles: readonly DetalleConProducto[];
}

export function useVentasConDetalle(limite = 50) {
  return useQuery<VentaConDetalle[]>({
    queryKey: ['ventas-con-detalle', limite],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_ventas_con_detalle', {
        p_limite: limite,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as VentaConDetalle[];
    },
  });
}

export interface DevolucionPayload {
  readonly detalle_id: string;
  readonly cantidad: number;
  readonly cajero_id: string;
  readonly monto_reembolso: number;
  readonly motivo: string;
}

export function useRegistrarDevolucion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DevolucionPayload) => {
      const { data, error } = await supabase.rpc('fn_registrar_devolucion', {
        payload,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ventas-con-detalle'] });
      qc.invalidateQueries({ queryKey: ['productos'] });
      qc.invalidateQueries({ queryKey: ['devoluciones'] });
      qc.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}