// src/infrastructure/supabase/queries/kpis.queries.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../client';

/* ============================================================
   HELPERS DE FECHAS
   ============================================================ */
function hoyISO(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

function ayerISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0] ?? '';
}

function inicioMesISO(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0] ?? '';
}

function inicioMesAnteriorISO(): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0] ?? '';
}

function finMesAnteriorISO(): string {
  const d = new Date();
  d.setDate(0);
  return d.toISOString().split('T')[0] ?? '';
}

/* ============================================================
   TIPOS DE KPIs
   ============================================================ */
export interface ResumenKPIs {
  readonly ventasMonto: number;
  readonly facturasCount: number;
  readonly gananciaMonto: number;
  readonly ticketPromedio: number;
}

export interface KPIsConComparativa {
  readonly hoy: ResumenKPIs;
  readonly ayer: ResumenKPIs;
  readonly mesActual: ResumenKPIs;
  readonly mesAnterior: ResumenKPIs;
  readonly productosStockBajo: number;
}

/* ============================================================
   HOOK PRINCIPAL
   ============================================================ */
export function useKPIsResumen() {
  return useQuery<KPIsConComparativa>({
    queryKey: ['kpis-resumen'],
    refetchInterval: 60_000, // Refresca cada minuto
    queryFn: async () => {
      const [hoyRes, ayerRes, mesRes, mesAntRes, stockBajoRes] =
        await Promise.all([
          // Hoy
          supabase.rpc('fn_dashboard_kpis', {
            p_desde: hoyISO(),
            p_hasta: hoyISO(),
          }),
          // Ayer
          supabase.rpc('fn_dashboard_kpis', {
            p_desde: ayerISO(),
            p_hasta: ayerISO(),
          }),
          // Mes actual
          supabase.rpc('fn_dashboard_kpis', {
            p_desde: inicioMesISO(),
            p_hasta: hoyISO(),
          }),
          // Mes anterior
          supabase.rpc('fn_dashboard_kpis', {
            p_desde: inicioMesAnteriorISO(),
            p_hasta: finMesAnteriorISO(),
          }),
          // Productos con stock bajo
          supabase
            .from('productos')
            .select('id', { count: 'exact', head: true })
            .eq('activo', true)
            .filter('stock', 'lte', 'stock_minimo'),
        ]);

      const formatear = (data: unknown): ResumenKPIs => {
        const fila = (Array.isArray(data) ? data[0] : null) as
          | {
              total_facturas?: number;
              total_transacciones?: number;
              ganancia_neta?: number;
            }
          | null;
        const facturas = Number(fila?.total_facturas ?? 0);
        const monto = Number(fila?.total_transacciones ?? 0);
        const ganancia = Number(fila?.ganancia_neta ?? 0);
        return {
          ventasMonto: monto,
          facturasCount: facturas,
          gananciaMonto: ganancia,
          ticketPromedio: facturas > 0 ? monto / facturas : 0,
        };
      };

      return {
        hoy: formatear(hoyRes.data),
        ayer: formatear(ayerRes.data),
        mesActual: formatear(mesRes.data),
        mesAnterior: formatear(mesAntRes.data),
        productosStockBajo: stockBajoRes.count ?? 0,
      };
    },
  });
}

/* ============================================================
   CÁLCULO DE DELTA (variación porcentual)
   Retorna:
   - null → sin datos en ningún periodo (no mostrar nada)
   - 999  → caso especial "primer registro" (había 0 antes)
   - 0    → sin cambios
   - otro → porcentaje real de variación
   ============================================================ */
export function calcularDelta(
  actual: number,
  anterior: number,
): number | null {
  if (anterior === 0 && actual === 0) return null;
  if (anterior === 0) return 999;
  return ((actual - anterior) / anterior) * 100;
}