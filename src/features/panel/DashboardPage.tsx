// src/features/panel/DashboardPage.tsx

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  Legend,
} from 'recharts';
import {
  Package, Receipt, DollarSign, TrendingUp,
  AlertTriangle, RotateCcw, Inbox, BarChart3,
  PieChart as PieIcon, Clock, Calendar, AlertCircle,
  CalendarDays, CalendarRange,
} from 'lucide-react';
import { KpiCard } from './components/KpiCard';
import { ChartCard } from './components/ChartCard';
import {
  useVencimientos, useDevoluciones,
  useVentasPorDia, useVentasRecientes,
} from '@/infrastructure/supabase/queries/dashboard.queries';
import {
  useKPIsResumen,
  calcularDelta,
} from '@/infrastructure/supabase/queries/kpis.queries';
import {
  useTopProductos,
  useVentasPorCategoria,
} from '@/infrastructure/supabase/queries/reportes.queries';
import {
  useVentasPorDiaSemana,
  useVentasPorHora,
} from '@/infrastructure/supabase/queries/graficas.queries';

const COLORES = ['#059669', '#171717', '#737373', '#a3a3a3', '#d4d4d4'];

export function DashboardPage() {
  const { data: kpis } = useKPIsResumen();
  const { data: vencimientos = [] } = useVencimientos(30);
  const { data: devoluciones = [] } = useDevoluciones(10);
  const { data: ventasPorDia = [] } = useVentasPorDia(30);
  const { data: ventasPorDiaSemana = [] } = useVentasPorDiaSemana(60);
  const { data: ventasPorHora = [] } = useVentasPorHora(30);
  const { data: ventasRecientes = [] } = useVentasRecientes(5);
  const { data: topProductos = [] } = useTopProductos(8, 30);
  const { data: categorias = [] } = useVentasPorCategoria(30);

  const fmtMoneda = (n: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(n);

  const fmtNumero = (n: number) => new Intl.NumberFormat('es-MX').format(n);

  const totalDevolucionesMonto = devoluciones.reduce(
    (acc, d) => acc + Number(d.monto_reembolso),
    0,
  );

  const sinVentas = ventasPorDia.every((p) => p.ingresos === 0);

  return (
    <div className="space-y-6">
      {/* ============================================================
          BLOQUE 1 — KPIs HOY + MES con comparativas reales
          ============================================================ */}
      <section className="space-y-3">
        {/* Etiqueta de sección: HOY */}
        <div className="flex items-center gap-3">
          <CalendarDays className="h-3.5 w-3.5 text-neutral-500" />
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-500">
            Hoy
          </p>
          <div className="flex-1 border-t border-neutral-200" />
        </div>

        {/* KPIs de HOY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Ventas de hoy"
            valor={kpis ? fmtMoneda(kpis.hoy.ventasMonto) : '—'}
            icono={<DollarSign className="h-4 w-4" />}
            tono="accent"
            delta={calcularDelta(
              kpis?.hoy.ventasMonto ?? 0,
              kpis?.ayer.ventasMonto ?? 0,
            )}
          />
          <KpiCard
            label="Facturas hoy"
            valor={kpis ? fmtNumero(kpis.hoy.facturasCount) : '—'}
            icono={<Receipt className="h-4 w-4" />}
            tono="neutral"
            delta={calcularDelta(
              kpis?.hoy.facturasCount ?? 0,
              kpis?.ayer.facturasCount ?? 0,
            )}
          />
          <KpiCard
            label="Ganancia de hoy"
            valor={kpis ? fmtMoneda(kpis.hoy.gananciaMonto) : '—'}
            icono={<TrendingUp className="h-4 w-4" />}
            tono="accent"
            delta={calcularDelta(
              kpis?.hoy.gananciaMonto ?? 0,
              kpis?.ayer.gananciaMonto ?? 0,
            )}
          />
          <KpiCard
            label="Ticket promedio"
            valor={kpis ? fmtMoneda(kpis.hoy.ticketPromedio) : '—'}
            icono={<Package className="h-4 w-4" />}
            tono="neutral"
            descripcion="Monto medio por factura"
          />
        </div>

        {/* Etiqueta de sección: MES ACTUAL */}
        <div className="flex items-center gap-3 pt-2">
          <CalendarRange className="h-3.5 w-3.5 text-neutral-500" />
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-500">
            Mes actual
          </p>
          <div className="flex-1 border-t border-neutral-200" />
        </div>

        {/* KPIs del MES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            label="Ventas del mes"
            valor={kpis ? fmtMoneda(kpis.mesActual.ventasMonto) : '—'}
            icono={<DollarSign className="h-4 w-4" />}
            tono="accent"
            delta={calcularDelta(
              kpis?.mesActual.ventasMonto ?? 0,
              kpis?.mesAnterior.ventasMonto ?? 0,
            )}
          />
          <KpiCard
            label="Facturas del mes"
            valor={kpis ? fmtNumero(kpis.mesActual.facturasCount) : '—'}
            icono={<Receipt className="h-4 w-4" />}
            tono="neutral"
            delta={calcularDelta(
              kpis?.mesActual.facturasCount ?? 0,
              kpis?.mesAnterior.facturasCount ?? 0,
            )}
          />
          <KpiCard
            label="Ganancia del mes"
            valor={kpis ? fmtMoneda(kpis.mesActual.gananciaMonto) : '—'}
            icono={<TrendingUp className="h-4 w-4" />}
            tono="accent"
            delta={calcularDelta(
              kpis?.mesActual.gananciaMonto ?? 0,
              kpis?.mesAnterior.gananciaMonto ?? 0,
            )}
          />
          <KpiCard
            label="Stock bajo"
            valor={kpis ? fmtNumero(kpis.productosStockBajo) : '—'}
            icono={<AlertCircle className="h-4 w-4" />}
            tono={kpis && kpis.productosStockBajo > 0 ? 'rose' : 'neutral'}
            descripcion={
              kpis && kpis.productosStockBajo > 0
                ? 'Productos por reabastecer'
                : 'Todo en orden'
            }
          />
        </div>
      </section>

      {/* ============================================================
          BLOQUE 2 — Gráfica principal (área) full width
          ============================================================ */}
      <ChartCard
        titulo="Rendimiento de los últimos 30 días"
        subtitulo="Ingresos vs utilidad"
        icono={<TrendingUp className="h-4 w-4 text-neutral-700" />}
        altura="h-80"
        extra={
          <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-accent-600" />
              <span className="text-neutral-600">Ingresos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-neutral-400" />
              <span className="text-neutral-600">Utilidad</span>
            </div>
          </div>
        }
      >
        {sinVentas ? (
          <EstadoVacio
            icono={<Inbox className="h-6 w-6" />}
            titulo="Sin ventas registradas"
            descripcion="La gráfica se poblará cuando emitas las primeras facturas."
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={ventasPorDia}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="gAccent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a3a3a3" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#a3a3a3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="#e5e5e5"
                vertical={false}
              />
              <XAxis
                dataKey="etiqueta"
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={56}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 0,
                  border: '1px solid #171717',
                  background: '#0a0a0a',
                  color: '#fafafa',
                  fontSize: 12,
                  padding: '8px 12px',
                }}
                labelStyle={{
                  color: '#a3a3a3',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
                formatter={(valor, nombre) => [
                  fmtMoneda(Number(valor ?? 0)),
                  nombre === 'ingresos' ? 'Ingresos' : 'Utilidad',
                ]}
              />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="#059669"
                fill="url(#gAccent)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="utilidad"
                stroke="#737373"
                fill="url(#gNeutral)"
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* ============================================================
          BLOQUE 3 — Grid de 2 columnas: Top productos + Categorías
          ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          titulo="Productos más vendidos"
          subtitulo="Últimos 30 días · por unidades"
          icono={<BarChart3 className="h-4 w-4 text-neutral-700" />}
        >
          {topProductos.length === 0 ? (
            <EstadoVacio
              icono={<Package className="h-6 w-6" />}
              titulo="Sin productos vendidos"
              descripcion="Registra ventas para ver el ranking."
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topProductos}
                layout="vertical"
                margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="2 4"
                  stroke="#e5e5e5"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="producto_nombre"
                  stroke="#737373"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                />
                <Tooltip
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{
                    borderRadius: 0,
                    border: '1px solid #171717',
                    background: '#0a0a0a',
                    color: '#fafafa',
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${v} unidades`, 'Vendidos']}
                />
                <Bar dataKey="unidades_vendidas" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          titulo="Ventas por categoría"
          subtitulo="Distribución de ingresos"
          icono={<PieIcon className="h-4 w-4 text-neutral-700" />}
        >
          {categorias.length === 0 ? (
            <EstadoVacio
              icono={<PieIcon className="h-6 w-6" />}
              titulo="Sin categorías con ventas"
              descripcion="Cuando vendas verás la distribución."
            />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorias}
                  dataKey="ingresos"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  innerRadius="45%"
                  paddingAngle={2}
                >
                  {categorias.map((item, i) => (
                    <Cell key={item.categoria} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 0,
                    border: '1px solid #171717',
                    background: '#0a0a0a',
                    color: '#fafafa',
                    fontSize: 12,
                  }}
                  formatter={(v) => fmtMoneda(Number(v ?? 0))}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="square"
                  wrapperStyle={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </section>

      {/* ============================================================
          BLOQUE 4 — Grid de 2 columnas: Día de semana + Hora
          ============================================================ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          titulo="Patrón semanal"
          subtitulo="Ingresos por día de la semana · 60 días"
          icono={<Calendar className="h-4 w-4 text-neutral-700" />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ventasPorDiaSemana}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="#e5e5e5"
                vertical={false}
              />
              <XAxis
                dataKey="dia"
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={56}
              />
              <Tooltip
                cursor={{ fill: '#f5f5f5' }}
                contentStyle={{
                  borderRadius: 0,
                  border: '1px solid #171717',
                  background: '#0a0a0a',
                  color: '#fafafa',
                  fontSize: 12,
                }}
                formatter={(v) => [fmtMoneda(Number(v ?? 0)), 'Ingresos']}
              />
              <Bar dataKey="ingresos" fill="#171717" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          titulo="Distribución horaria"
          subtitulo="Ingresos por hora del día · 30 días"
          icono={<Clock className="h-4 w-4 text-neutral-700" />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={ventasPorHora}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="gHora" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="#e5e5e5"
                vertical={false}
              />
              <XAxis
                dataKey="hora"
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                stroke="#737373"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
                width={56}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 0,
                  border: '1px solid #171717',
                  background: '#0a0a0a',
                  color: '#fafafa',
                  fontSize: 12,
                }}
                formatter={(v) => [fmtMoneda(Number(v ?? 0)), 'Ingresos']}
              />
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke="#059669"
                fill="url(#gHora)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* ============================================================
          BLOQUE 5 — Grid inferior: Vencimientos + Devoluciones
          ============================================================ */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-neutral-300">
          <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <div>
                <h2 className="text-sm font-bold text-neutral-950 tracking-tight">
                  Productos próximos a vencer
                </h2>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500">
                  Ventana de 30 días
                </p>
              </div>
            </div>
            <span className="text-xs font-bold tracking-wider uppercase px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200">
              {vencimientos.length}
            </span>
          </header>

          <div className="overflow-x-auto">
            {vencimientos.length === 0 ? (
              <EstadoVacio
                icono={<Package className="h-6 w-6" />}
                titulo="Sin vencimientos próximos"
                descripcion="Todos los productos tienen fecha lejana o no perecedera."
              />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                      Producto
                    </th>
                    <th className="text-left px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                      SKU
                    </th>
                    <th className="text-right px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                      Stock
                    </th>
                    <th className="text-right px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                      Días
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vencimientos.map((p) => {
                    const critico = p.dias_restantes <= 7;
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50"
                      >
                        <td className="px-6 py-3 font-medium text-neutral-900">
                          {p.nombre}
                        </td>
                        <td className="px-6 py-3 text-neutral-500 font-mono text-xs">
                          {p.sku}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums text-neutral-700">
                          {p.stock}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-bold tracking-wider uppercase border ${
                              critico
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {p.dias_restantes}d
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside className="bg-white border border-neutral-300">
          <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-4 w-4 text-neutral-700" />
              <div>
                <h2 className="text-sm font-bold text-neutral-950 tracking-tight">
                  Devoluciones
                </h2>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500">
                  Últimos 30 días
                </p>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-5">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-2">
                Eventos
              </p>
              <p className="text-3xl font-bold text-neutral-950 tabular-nums">
                {devoluciones.length}
              </p>
            </div>

            <div className="border-t border-neutral-200 pt-5">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-2">
                Monto reembolsado
              </p>
              <p className="text-2xl font-bold text-rose-700 tabular-nums">
                {fmtMoneda(totalDevolucionesMonto)}
              </p>
            </div>

            {ventasRecientes.length > 0 && (
              <div className="border-t border-neutral-200 pt-5">
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-3">
                  Últimas ventas
                </p>
                <ul className="space-y-2">
                  {ventasRecientes.map((v) => (
                    <li
                      key={v.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-neutral-700 font-mono">
                        {v.numero_factura}
                      </span>
                      <span className="tabular-nums font-semibold text-neutral-900">
                        {fmtMoneda(Number(v.total))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

/* ============================================================
   Subcomponente: estado vacío
   ============================================================ */
function EstadoVacio({
  icono, titulo, descripcion,
}: {
  icono: React.ReactNode;
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-12 w-12 border border-neutral-300 flex items-center justify-center text-neutral-400 mb-4">
        {icono}
      </div>
      <p className="text-sm font-semibold text-neutral-700">{titulo}</p>
      <p className="mt-1 text-xs text-neutral-500 max-w-xs">{descripcion}</p>
    </div>
  );
}