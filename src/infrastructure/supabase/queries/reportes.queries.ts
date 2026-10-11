// src/infrastructure/supabase/queries/reportes.queries.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../client';

/* ============================================================
   TOP PRODUCTOS MÁS VENDIDOS
   ============================================================ */
export interface ProductoTop {
  readonly producto_id: string;
  readonly producto_nombre: string;
  readonly sku: string;
  readonly unidades_vendidas: number;
  readonly ingresos_generados: number;
}

export function useTopProductos(limite = 10, dias = 30) {
  return useQuery<ProductoTop[]>({
    queryKey: ['top-productos', limite, dias],
    queryFn: async () => {
      const desde = new Date();
      desde.setDate(desde.getDate() - dias);

      const { data, error } = await supabase
        .from('detalles_ventas')
        .select(`
          producto_id,
          cantidad,
          subtotal_linea,
          productos:producto_id ( nombre, sku ),
          ventas:venta_id!inner ( created_at, estado )
        `)
        .gte('ventas.created_at', desde.toISOString())
        .eq('ventas.estado', 'PAGADA');

      if (error) throw new Error(error.message);

      // Agrupar en cliente
      const mapa = new Map<string, {
        producto_nombre: string;
        sku: string;
        unidades: number;
        ingresos: number;
      }>();

      type Fila = {
        producto_id: string;
        cantidad: number;
        subtotal_linea: number;
        productos: { nombre: string; sku: string } | null;
      };

      for (const d of (data ?? []) as unknown as Fila[]) {
        const actual = mapa.get(d.producto_id) ?? {
          producto_nombre: d.productos?.nombre ?? 'Desconocido',
          sku: d.productos?.sku ?? '—',
          unidades: 0,
          ingresos: 0,
        };
        actual.unidades += d.cantidad;
        actual.ingresos += Number(d.subtotal_linea);
        mapa.set(d.producto_id, actual);
      }

      return Array.from(mapa.entries())
        .map(([id, v]): ProductoTop => ({
          producto_id: id,
          producto_nombre: v.producto_nombre,
          sku: v.sku,
          unidades_vendidas: v.unidades,
          ingresos_generados: v.ingresos,
        }))
        .sort((a, b) => b.unidades_vendidas - a.unidades_vendidas)
        .slice(0, limite);
    },
  });
}

/* ============================================================
   VENTAS POR CATEGORÍA
   ============================================================ */
export interface VentaCategoria {
  readonly categoria: string;
  readonly unidades: number;
  readonly ingresos: number;
}

export function useVentasPorCategoria(dias = 30) {
  return useQuery<VentaCategoria[]>({
    queryKey: ['ventas-por-categoria', dias],
    queryFn: async () => {
      const desde = new Date();
      desde.setDate(desde.getDate() - dias);

      const { data, error } = await supabase
        .from('detalles_ventas')
        .select(`
          cantidad,
          subtotal_linea,
          productos:producto_id (
            categorias:categoria_id ( nombre )
          ),
          ventas:venta_id!inner ( created_at, estado )
        `)
        .gte('ventas.created_at', desde.toISOString())
        .eq('ventas.estado', 'PAGADA');

      if (error) throw new Error(error.message);

      const mapa = new Map<string, { unidades: number; ingresos: number }>();

      type Fila = {
        cantidad: number;
        subtotal_linea: number;
        productos: {
          categorias: { nombre: string } | null;
        } | null;
      };

      for (const d of (data ?? []) as unknown as Fila[]) {
        const cat = d.productos?.categorias?.nombre ?? 'Sin categoría';
        const actual = mapa.get(cat) ?? { unidades: 0, ingresos: 0 };
        actual.unidades += d.cantidad;
        actual.ingresos += Number(d.subtotal_linea);
        mapa.set(cat, actual);
      }

      return Array.from(mapa.entries())
        .map(([categoria, v]): VentaCategoria => ({
          categoria,
          unidades: v.unidades,
          ingresos: v.ingresos,
        }))
        .sort((a, b) => b.ingresos - a.ingresos);
    },
  });
}

/* ============================================================
   MÉTRICAS DE DEVOLUCIONES (control de riesgos)
   ============================================================ */
export interface MetricasDevoluciones {
  readonly total_eventos: number;
  readonly monto_total: number;
  readonly tasa_sobre_ventas: number;
  readonly motivo_mas_comun: string;
}

export function useMetricasDevoluciones(dias = 30) {
  return useQuery<MetricasDevoluciones>({
    queryKey: ['metricas-devoluciones', dias],
    queryFn: async () => {
      const desde = new Date();
      desde.setDate(desde.getDate() - dias);

      const { data: devoluciones, error: err1 } = await supabase
        .from('devoluciones')
        .select('monto_reembolso, motivo')
        .gte('created_at', desde.toISOString());

      if (err1) throw new Error(err1.message);

      const { data: ventas, error: err2 } = await supabase
        .from('ventas')
        .select('total')
        .gte('created_at', desde.toISOString())
        .eq('estado', 'PAGADA');

      if (err2) throw new Error(err2.message);

      const totalDevoluciones = (devoluciones ?? []).reduce(
        (acc, d) => acc + Number(d.monto_reembolso),
        0,
      );
      const totalVentas = (ventas ?? []).reduce(
        (acc, v) => acc + Number(v.total),
        0,
      );

      // Motivo más común
      const motivos = new Map<string, number>();
      for (const d of devoluciones ?? []) {
        motivos.set(d.motivo, (motivos.get(d.motivo) ?? 0) + 1);
      }
      const motivoMasComun =
        Array.from(motivos.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
        'Sin devoluciones';

      return {
        total_eventos: devoluciones?.length ?? 0,
        monto_total: totalDevoluciones,
        tasa_sobre_ventas:
          totalVentas > 0 ? (totalDevoluciones / totalVentas) * 100 : 0,
        motivo_mas_comun: motivoMasComun,
      };
    },
  });
}