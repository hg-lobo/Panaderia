// src/infrastructure/supabase/queries/graficas.queries.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../client';

/* ============================================================
   VENTAS POR DÍA DE LA SEMANA
   Agrupa las ventas por día (Lun, Mar, ...) sumando los últimos
   N días para detectar patrones semanales.
   ============================================================ */
export interface PuntoDiaSemana {
  readonly dia: string;      // Lun, Mar, ...
  readonly diaIndex: number; // 0=Lun, 6=Dom
  readonly ingresos: number;
  readonly facturas: number;
}

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function useVentasPorDiaSemana(dias = 30) {
  return useQuery<PuntoDiaSemana[]>({
    queryKey: ['ventas-por-dia-semana', dias],
    queryFn: async () => {
      const desde = new Date();
      desde.setDate(desde.getDate() - dias);

      const { data, error } = await supabase
        .from('ventas')
        .select('created_at, total')
        .gte('created_at', desde.toISOString())
        .eq('estado', 'PAGADA');

      if (error) throw new Error(error.message);

      // Inicializar todos los días en 0
      const acumulado = new Map<number, { ingresos: number; facturas: number }>();
      for (let i = 0; i < 7; i++) {
        acumulado.set(i, { ingresos: 0, facturas: 0 });
      }

      for (const v of data ?? []) {
        const fecha = new Date(v.created_at);
        const diaIndex = fecha.getDay();
        const actual = acumulado.get(diaIndex) ?? { ingresos: 0, facturas: 0 };
        actual.ingresos += Number(v.total);
        actual.facturas += 1;
        acumulado.set(diaIndex, actual);
      }

      // Orden: Lun, Mar, Mié, Jue, Vie, Sáb, Dom
      const orden = [1, 2, 3, 4, 5, 6, 0];
      return orden.map((idx): PuntoDiaSemana => {
        const val = acumulado.get(idx) ?? { ingresos: 0, facturas: 0 };
        return {
          dia: DIAS_ES[idx] ?? '—',
          diaIndex: idx,
          ingresos: +val.ingresos.toFixed(2),
          facturas: val.facturas,
        };
      });
    },
  });
}

/* ============================================================
   VENTAS POR HORA DEL DÍA (heatmap simple)
   Distribución horaria de las ventas en el periodo.
   ============================================================ */
export interface PuntoHora {
  readonly hora: string;   // "09:00"
  readonly horaIndex: number;
  readonly ingresos: number;
  readonly facturas: number;
}

export function useVentasPorHora(dias = 30) {
  return useQuery<PuntoHora[]>({
    queryKey: ['ventas-por-hora', dias],
    queryFn: async () => {
      const desde = new Date();
      desde.setDate(desde.getDate() - dias);

      const { data, error } = await supabase
        .from('ventas')
        .select('created_at, total')
        .gte('created_at', desde.toISOString())
        .eq('estado', 'PAGADA');

      if (error) throw new Error(error.message);

      const acumulado = new Map<number, { ingresos: number; facturas: number }>();
      for (let h = 0; h < 24; h++) {
        acumulado.set(h, { ingresos: 0, facturas: 0 });
      }

      for (const v of data ?? []) {
        const hora = new Date(v.created_at).getHours();
        const actual = acumulado.get(hora) ?? { ingresos: 0, facturas: 0 };
        actual.ingresos += Number(v.total);
        actual.facturas += 1;
        acumulado.set(hora, actual);
      }

      return Array.from(acumulado.entries()).map(([hora, val]): PuntoHora => ({
        hora: `${String(hora).padStart(2, '0')}:00`,
        horaIndex: hora,
        ingresos: +val.ingresos.toFixed(2),
        facturas: val.facturas,
      }));
    },
  });
}

/* ============================================================
   COMPARATIVA: PERIODO ACTUAL vs PERIODO ANTERIOR
   Calcula los KPIs de los últimos N días y de los N días anteriores
   para mostrar la variación real (delta calculado).
   ============================================================ */
export interface ComparativaKPIs {
  readonly actual: {
    readonly productos: number;
    readonly facturas: number;
    readonly transacciones: number;
    readonly ganancia: number;
  };
  readonly anterior: {
    readonly productos: number;
    readonly facturas: number;
    readonly transacciones: number;
    readonly ganancia: number;
  };
  readonly delta: {
    readonly productos: number;
    readonly facturas: number;
    readonly transacciones: number;
    readonly ganancia: number;
  };
}

export function useComparativaKPIs(dias = 30) {
  return useQuery<ComparativaKPIs>({
    queryKey: ['comparativa-kpis', dias],
    queryFn: async () => {
      const hoy = new Date();
      const inicioActual = new Date();
      inicioActual.setDate(inicioActual.getDate() - dias);
      const inicioAnterior = new Date();
      inicioAnterior.setDate(inicioAnterior.getDate() - dias * 2);

      const [actualRes, anteriorRes] = await Promise.all([
        supabase.rpc('fn_dashboard_kpis', {
          p_desde: inicioActual.toISOString().split('T')[0],
          p_hasta: hoy.toISOString().split('T')[0],
        }),
        supabase.rpc('fn_dashboard_kpis', {
          p_desde: inicioAnterior.toISOString().split('T')[0],
          p_hasta: inicioActual.toISOString().split('T')[0],
        }),
      ]);

      if (actualRes.error) throw new Error(actualRes.error.message);
      if (anteriorRes.error) throw new Error(anteriorRes.error.message);

      const a = actualRes.data?.[0];
      const b = anteriorRes.data?.[0];

      const actual = {
        productos: Number(a?.total_productos_vendidos ?? 0),
        facturas: Number(a?.total_facturas ?? 0),
        transacciones: Number(a?.total_transacciones ?? 0),
        ganancia: Number(a?.ganancia_neta ?? 0),
      };
      const anterior = {
        productos: Number(b?.total_productos_vendidos ?? 0),
        facturas: Number(b?.total_facturas ?? 0),
        transacciones: Number(b?.total_transacciones ?? 0),
        ganancia: Number(b?.ganancia_neta ?? 0),
      };

      const calcDelta = (act: number, ant: number) =>
        ant === 0 ? (act > 0 ? 100 : 0) : ((act - ant) / ant) * 100;

      return {
        actual,
        anterior,
        delta: {
          productos: calcDelta(actual.productos, anterior.productos),
          facturas: calcDelta(actual.facturas, anterior.facturas),
          transacciones: calcDelta(actual.transacciones, anterior.transacciones),
          ganancia: calcDelta(actual.ganancia, anterior.ganancia),
        },
      };
    },
  });
}