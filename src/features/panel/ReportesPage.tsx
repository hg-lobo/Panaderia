// src/features/panel/ReportesPage.tsx

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, Package, PieChart as PieIcon, RotateCcw } from 'lucide-react';
import {
  useTopProductos,
  useVentasPorCategoria,
  useMetricasDevoluciones,
} from '@/infrastructure/supabase/queries/reportes.queries';

const COLORES = ['#059669', '#171717', '#737373', '#a3a3a3', '#d4d4d4'];

type Rango = 7 | 30 | 90;

export function ReportesPage() {
  const [dias, setDias] = useState<Rango>(30);

  const { data: topProductos = [], isLoading: cargandoTop } = useTopProductos(10, dias);
  const { data: categorias = [], isLoading: cargandoCat } = useVentasPorCategoria(dias);
  const { data: metricas, isLoading: cargandoMet } = useMetricasDevoluciones(dias);

  const fmtMoneda = (n: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="space-y-6">
      {/* Header con selector de rango */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 border border-neutral-300 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-neutral-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
              Reportes de rendimiento
            </h2>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500">
              Últimos {dias} días
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 border border-neutral-300 p-1 bg-white">
          {[7, 30, 90].map((r) => (
            <button
              key={r}
              onClick={() => setDias(r as Rango)}
              className={`px-4 py-1.5 text-xs font-bold tracking-wider uppercase transition-colors ${
                dias === r
                  ? 'bg-neutral-950 text-white'
                  : 'text-neutral-600 hover:text-neutral-950'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Grid de gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top productos */}
        <div className="bg-white border border-neutral-300">
          <header className="flex items-center gap-3 border-b border-neutral-200 px-6 py-4">
            <Package className="h-4 w-4 text-neutral-700" />
            <div>
              <h3 className="text-sm font-bold text-neutral-950 tracking-tight">
                Productos más vendidos
              </h3>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500">
                Por unidades
              </p>
            </div>
          </header>
          <div className="p-4 h-80">
            {cargandoTop ? (
              <Centrado><Spinner /></Centrado>
            ) : topProductos.length === 0 ? (
              <Centrado>
                <p className="text-xs text-neutral-500">Sin ventas en el periodo</p>
              </Centrado>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProductos}
                  layout="vertical"
                  margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="2 4" stroke="#e5e5e5" horizontal={false} />
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
          </div>
        </div>

        {/* Ventas por categoría */}
        <div className="bg-white border border-neutral-300">
          <header className="flex items-center gap-3 border-b border-neutral-200 px-6 py-4">
            <PieIcon className="h-4 w-4 text-neutral-700" />
            <div>
              <h3 className="text-sm font-bold text-neutral-950 tracking-tight">
                Ventas por categoría
              </h3>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500">
                Distribución de ingresos
              </p>
            </div>
          </header>
          <div className="p-4 h-80">
            {cargandoCat ? (
              <Centrado><Spinner /></Centrado>
            ) : categorias.length === 0 ? (
              <Centrado>
                <p className="text-xs text-neutral-500">Sin datos en el periodo</p>
              </Centrado>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorias}
                    dataKey="ingresos"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
                    paddingAngle={2}
                  >
                    {categorias.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
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
          </div>
        </div>
      </div>

      {/* Métricas de devoluciones */}
      <div className="bg-white border border-neutral-300">
        <header className="flex items-center gap-3 border-b border-neutral-200 px-6 py-4">
          <RotateCcw className="h-4 w-4 text-neutral-700" />
          <div>
            <h3 className="text-sm font-bold text-neutral-950 tracking-tight">
              Control de riesgos — Devoluciones
            </h3>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500">
              Últimos {dias} días
            </p>
          </div>
        </header>

        {cargandoMet ? (
          <div className="py-12">
            <Centrado><Spinner /></Centrado>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 border-t border-neutral-200">
            <Metrica label="Eventos" valor={String(metricas?.total_eventos ?? 0)} />
            <Metrica
              label="Monto reembolsado"
              valor={fmtMoneda(metricas?.monto_total ?? 0)}
              tono="rose"
            />
            <Metrica
              label="Tasa sobre ventas"
              valor={`${(metricas?.tasa_sobre_ventas ?? 0).toFixed(2)}%`}
            />
            <Metrica
              label="Motivo más común"
              valor={metricas?.motivo_mas_comun ?? '—'}
              pequeño
            />
          </div>
        )}
      </div>

      {/* Tabla detallada de top productos */}
      {topProductos.length > 0 && (
        <div className="bg-white border border-neutral-300">
          <header className="border-b border-neutral-200 px-6 py-4">
            <h3 className="text-sm font-bold text-neutral-950 tracking-tight">
              Detalle de rendimiento
            </h3>
          </header>
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                  Producto
                </th>
                <th className="text-left px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                  SKU
                </th>
                <th className="text-right px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                  Unidades
                </th>
                <th className="text-right px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                  Ingresos
                </th>
              </tr>
            </thead>
            <tbody>
              {topProductos.map((p) => (
                <tr
                  key={p.producto_id}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <td className="px-6 py-3 font-medium text-neutral-900">
                    {p.producto_nombre}
                  </td>
                  <td className="px-6 py-3 font-mono text-xs text-neutral-500">
                    {p.sku}
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums font-semibold text-neutral-900">
                    {p.unidades_vendidas}
                  </td>
                  <td className="px-6 py-3 text-right tabular-nums text-accent-700 font-semibold">
                    {fmtMoneda(p.ingresos_generados)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Subcomponentes
   ============================================================ */
function Metrica({
  label, valor, tono = 'neutral', pequeño = false,
}: {
  label: string;
  valor: string;
  tono?: 'neutral' | 'rose';
  pequeño?: boolean;
}) {
  return (
    <div className="bg-white p-6">
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-2">
        {label}
      </p>
      <p
        className={`font-bold tabular-nums ${
          pequeño ? 'text-base' : 'text-2xl'
        } ${tono === 'rose' ? 'text-rose-700' : 'text-neutral-950'}`}
      >
        {valor}
      </p>
    </div>
  );
}

function Centrado({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex items-center justify-center">{children}</div>
  );
}

function Spinner() {
  return (
    <div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
  );
}