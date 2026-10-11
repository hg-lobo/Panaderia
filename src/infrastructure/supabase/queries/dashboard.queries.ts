// src/infrastructure/supabase/queries/dashboard.queries.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../client';
import type {
  KPIsDashboard, ProductoPorVencer, Producto,
  Combo, Venta, Devolucion, ReglaNegocio,
} from '../../types/database.types';

/* ============================================================
   KPIs DEL DASHBOARD
   Llama a la función fn_dashboard_kpis con rango de fechas
   ============================================================ */
export function useKPIs(desde: Date, hasta: Date) {
  return useQuery<KPIsDashboard>({
    queryKey: ['kpis', desde.toISOString(), hasta.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_dashboard_kpis', {
        p_desde: desde.toISOString().split('T')[0],
        p_hasta: hasta.toISOString().split('T')[0],
      });

      if (error) throw new Error(error.message);

      const fila = data?.[0];
      return {
        total_productos_vendidos: Number(fila?.total_productos_vendidos ?? 0),
        total_facturas: Number(fila?.total_facturas ?? 0),
        total_transacciones: Number(fila?.total_transacciones ?? 0),
        ganancia_neta: Number(fila?.ganancia_neta ?? 0),
      };
    },
  });
}

/* ============================================================
   PRODUCTOS POR VENCER
   ============================================================ */
export function useVencimientos(dias = 30) {
  return useQuery<ProductoPorVencer[]>({
    queryKey: ['vencimientos', dias],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_productos_por_vencer', {
        dias,
      });
      if (error) throw new Error(error.message);
      return (data ?? []) as ProductoPorVencer[];
    },
  });
}

/* ============================================================
   PRODUCTOS (listado completo)
   ============================================================ */
export function useProductos() {
  return useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as Producto[];
    },
  });
}

/* ============================================================
   COMBOS (con sus items expandidos)
   ============================================================ */
export interface ComboConItems extends Combo {
  items: Array<{
    producto_id: string;
    cantidad: number;
    producto_nombre: string;
  }>;
}

export function useCombos() {
  return useQuery<ComboConItems[]>({
    queryKey: ['combos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('combos')
        .select(`
          *,
          combo_items (
            producto_id,
            cantidad,
            productos:producto_id ( nombre )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      return (data ?? []).map((c): ComboConItems => {
        const raw = c as unknown as Combo & {
          combo_items: Array<{
            producto_id: string;
            cantidad: number;
            productos: { nombre: string } | null;
          }>;
        };
        return {
          ...raw,
          items: (raw.combo_items ?? []).map((it) => ({
            producto_id: it.producto_id,
            cantidad: it.cantidad,
            producto_nombre: it.productos?.nombre ?? 'Producto',
          })),
        };
      });
    },
  });
}

/* ============================================================
   VENTAS RECIENTES
   ============================================================ */
export function useVentasRecientes(limite = 10) {
  return useQuery<Venta[]>({
    queryKey: ['ventas-recientes', limite],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limite);
      if (error) throw new Error(error.message);
      return (data ?? []) as Venta[];
    },
  });
}

/* ============================================================
   DEVOLUCIONES RECIENTES
   ============================================================ */
export function useDevoluciones(limite = 20) {
  return useQuery<Devolucion[]>({
    queryKey: ['devoluciones', limite],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devoluciones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limite);
      if (error) throw new Error(error.message);
      return (data ?? []) as Devolucion[];
    },
  });
}

/* ============================================================
   REGLAS DE NEGOCIO ACTIVAS
   ============================================================ */
export function useReglasActivas() {
  return useQuery<ReglaNegocio[]>({
    queryKey: ['reglas-activas'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_reglas_activas');
      if (error) throw new Error(error.message);
      return (data ?? []) as ReglaNegocio[];
    },
  });
}

/* ============================================================
   VENTAS AGRUPADAS POR DÍA (para gráfica)
   Trae ventas de los últimos N días y las agrupa en cliente
   ============================================================ */
export interface PuntoGrafica {
  fecha: string;      // YYYY-MM-DD
  etiqueta: string;   // 12 Oct
  ingresos: number;
  utilidad: number;
  facturas: number;
}

export function useVentasPorDia(dias = 30) {
  return useQuery<PuntoGrafica[]>({
    queryKey: ['ventas-por-dia', dias],
    queryFn: async () => {
      const desde = new Date();
      desde.setDate(desde.getDate() - dias);

      const { data, error } = await supabase
        .from('ventas')
        .select('created_at, total, estado')
        .gte('created_at', desde.toISOString())
        .eq('estado', 'PAGADA');

      if (error) throw new Error(error.message);

      // Agrupar por día
      const mapa = new Map<string, { ingresos: number; facturas: number }>();

      // Inicializar todos los días en 0
      for (let i = dias - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        if (key) mapa.set(key, { ingresos: 0, facturas: 0 });
      }

      for (const v of data ?? []) {
        const key = v.created_at.split('T')[0];
        if (!key) continue;
        const actual = mapa.get(key) ?? { ingresos: 0, facturas: 0 };
        actual.ingresos += Number(v.total);
        actual.facturas += 1;
        mapa.set(key, actual);
      }

      return Array.from(mapa.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([fecha, val]): PuntoGrafica => {
          const d = new Date(fecha + 'T12:00:00');
          const etiqueta = d.toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
          });
          // Utilidad aproximada (25% margen promedio si no hay detalle)
          const utilidad = val.ingresos * 0.25;
          return {
            fecha,
            etiqueta,
            ingresos: val.ingresos,
            utilidad,
            facturas: val.facturas,
          };
        });
    },
  });
}