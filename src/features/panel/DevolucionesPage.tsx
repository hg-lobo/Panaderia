// src/features/panel/DevolucionesPage.tsx

import { useState } from 'react';
import {
  RotateCcw, ChevronDown, ChevronRight,
  AlertCircle, CheckCircle2,
} from 'lucide-react';
import {
  useVentasConDetalle,
  useRegistrarDevolucion,
  type DetalleConProducto,
} from '@/infrastructure/supabase/queries/devoluciones.queries';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function DevolucionesPage() {
  const { data: ventas = [], isLoading } = useVentasConDetalle(50);
  const { sesion } = useAuth();
  const registrar = useRegistrarDevolucion();

  const [expandida, setExpandida] = useState<string | null>(null);
  const [detalleActivo, setDetalleActivo] = useState<DetalleConProducto | null>(null);
  const [ventaActiva, setVentaActiva] = useState<string>('');
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState('');
  const [exito, setExito] = useState<string | null>(null);

  const fmtMoneda = (n: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(n);

  const abrirDevolucion = (detalle: DetalleConProducto, ventaId: string) => {
    setDetalleActivo(detalle);
    setVentaActiva(ventaId);
    setCantidad(1);
    setMotivo('');
    setExito(null);
  };

  const cerrar = () => {
    setDetalleActivo(null);
    setMotivo('');
    setCantidad(1);
  };

  const handleRegistrar = async () => {
    if (!detalleActivo || !sesion?.user.id) return;
    if (motivo.trim() === '') return;

    const montoReembolso =
      (detalleActivo.precio_unitario * cantidad);

    try {
      await registrar.mutateAsync({
        detalle_id: detalleActivo.id,
        cantidad,
        cajero_id: sesion.user.id,
        monto_reembolso: montoReembolso,
        motivo: motivo.trim(),
      });
      setExito(`Devolución de ${cantidad} × ${detalleActivo.producto_nombre} registrada.`);
      setTimeout(() => {
        cerrar();
      }, 2000);
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Desconocido'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 border border-neutral-300 flex items-center justify-center">
          <RotateCcw className="h-4 w-4 text-neutral-700" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
            Devoluciones
          </h2>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500">
            {ventas.length} ventas registradas
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-neutral-300 py-16 text-center">
          <div className="mx-auto h-6 w-6 border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
        </div>
      ) : ventas.length === 0 ? (
        <div className="bg-white border border-neutral-300 py-16 text-center">
          <RotateCcw className="mx-auto h-8 w-8 text-neutral-300 mb-3" />
          <p className="text-sm font-semibold text-neutral-700">
            Sin ventas registradas
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Realiza una venta desde el POS para poder procesar devoluciones.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {ventas.map((v) => {
            const abierta = expandida === v.id;
            return (
              <article
                key={v.id}
                className="bg-white border border-neutral-300"
              >
                <button
                  onClick={() => setExpandida(abierta ? null : v.id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {abierta ? (
                      <ChevronDown className="h-4 w-4 text-neutral-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-neutral-500" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-bold text-neutral-950 font-mono">
                        {v.numero_factura}
                      </p>
                      <p className="text-[10px] text-neutral-500 tracking-wider uppercase">
                        {new Date(v.created_at).toLocaleString('es-MX')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-neutral-950 tabular-nums">
                      {fmtMoneda(Number(v.total))}
                    </p>
                    <p className="text-[10px] text-neutral-500 tracking-wider uppercase">
                      {v.detalles.length} línea{v.detalles.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>

                {abierta && (
                  <div className="border-t border-neutral-200 bg-stone-50/50">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-100/50">
                        <tr>
                          <th className="text-left px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                            Producto
                          </th>
                          <th className="text-right px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                            Cantidad
                          </th>
                          <th className="text-right px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                            Precio
                          </th>
                          <th className="text-right px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                            Subtotal
                          </th>
                          <th className="w-32 px-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {v.detalles.map((d) => (
                          <tr
                            key={d.id}
                            className="border-t border-neutral-200"
                          >
                            <td className="px-6 py-3 font-medium text-neutral-900">
                              {d.producto_nombre}
                            </td>
                            <td className="px-6 py-3 text-right tabular-nums text-neutral-700">
                              {d.cantidad}
                            </td>
                            <td className="px-6 py-3 text-right tabular-nums text-neutral-700">
                              {fmtMoneda(Number(d.precio_unitario))}
                            </td>
                            <td className="px-6 py-3 text-right tabular-nums font-semibold text-neutral-900">
                              {fmtMoneda(Number(d.subtotal_linea))}
                            </td>
                            <td className="px-3 py-3 text-right">
                              <button
                                onClick={() => abrirDevolucion(d, v.id)}
                                className="text-[10px] font-bold tracking-wider uppercase text-rose-600 hover:text-rose-800 transition-colors"
                              >
                                Devolver
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de devolución */}
      {detalleActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
            onClick={cerrar}
          />
          <div className="relative w-full max-w-md bg-white border border-neutral-300">
            <header className="border-b border-neutral-200 px-6 py-5">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent-700 mb-1">
                Procesar devolución
              </p>
              <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
                {detalleActivo.producto_nombre}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Venta {ventaActiva} · {detalleActivo.cantidad} unid. vendidas
              </p>
            </header>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-2">
                  Cantidad a devolver
                </label>
                <input
                  type="number"
                  min={1}
                  max={detalleActivo.cantidad}
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  className="w-full border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-2">
                  Motivo
                </label>
                <textarea
                  rows={3}
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Producto defectuoso, cambio de opinión, etc."
                  className="w-full border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 resize-none"
                />
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500">
                    Monto a reembolsar
                  </span>
                  <span className="text-xl font-bold text-rose-700 tabular-nums">
                    {fmtMoneda(detalleActivo.precio_unitario * cantidad)}
                  </span>
                </div>
              </div>

              {exito ? (
                <div className="flex items-start gap-3 border-l-2 border-accent-600 bg-accent-50 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-accent-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-accent-900 font-medium">{exito}</p>
                </div>
              ) : (
                <div className="flex items-start gap-3 border-l-2 border-amber-500 bg-amber-50 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900">
                    El stock del producto se reintegrará automáticamente.
                  </p>
                </div>
              )}
            </div>

            <footer className="border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={cerrar}
                className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-950 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrar}
                disabled={
                  registrar.isPending ||
                  motivo.trim() === '' ||
                  cantidad < 1 ||
                  cantidad > detalleActivo.cantidad ||
                  exito !== null
                }
                className="bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50 transition-colors"
              >
                {registrar.isPending ? 'Procesando...' : 'Registrar devolución'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}