// src/features/pos/PosPage.tsx

import { useMemo, useState } from 'react';
import {
  Search, Plus, Trash2, Minus,
  ShoppingCart, AlertTriangle, Sparkles, XCircle,
  CheckCircle2,
} from 'lucide-react';
import { useProductos, useCombos } from '@/infrastructure/supabase/queries/dashboard.queries';
import { useCheckout } from '@/infrastructure/supabase/queries/ventas.mutations';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePos } from './hooks/usePos';

export function PosPage() {
  const { data: productos = [], isLoading: cargandoProductos } = useProductos();
  const { data: combos = [] } = useCombos();
  const { sesion } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [ticket, setTicket] = useState<{ numero: string; total: number } | null>(null);

  const pos = usePos(combos, productos);
  const checkout = useCheckout();

  const productosFiltrados = useMemo(() => {
    if (busqueda.trim() === '') return productos.filter((p) => p.activo);
    return productos.filter(
      (p) =>
        p.activo &&
        (p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          p.sku.toLowerCase().includes(busqueda.toLowerCase())),
    );
  }, [productos, busqueda]);

  const fmtMoneda = (n: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(n);

  const handleAgregar = (p: (typeof productos)[number]) => {
    if (p.stock <= 0) return;
    pos.agregar(p);
  };

  const handleEliminar = (id: string) => {
    pos.quitar(id);
  };

  const handleCantidad = (id: string, delta: number) => {
    const linea = pos.lineas.find((l) => l.productoId === id);
    if (!linea) return;
    const nuevaCantidad = linea.cantidad + delta;
    if (nuevaCantidad <= 0) {
      pos.quitar(id);
    } else {
      pos.cambiarCantidad(id, nuevaCantidad);
    }
  };

  const handleCheckout = async () => {
    if (pos.lineas.length === 0 || !sesion?.user.id) return;

    const resultado = await pos.evaluar();

    if (resultado.bloqueos.length > 0) {
      alert('Venta bloqueada: ' + JSON.stringify(resultado.bloqueos[0]?.valor));
      return;
    }

    try {
      const res = await checkout.mutateAsync({
        cajero_id: sesion.user.id,
        subtotal: pos.totales.subtotal,
        descuentos: pos.totales.descuentos,
        total: pos.totales.total,
        lineas: pos.lineas,
        inferencias: resultado.traza,
      });

      setTicket({ numero: res.numero_factura, total: res.total });
      pos.limpiar();
    } catch (err) {
      alert('Error: ' + (err instanceof Error ? err.message : 'Desconocido'));
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        {/* ============================================================
            COLUMNA 1-2: Grilla de productos
            ============================================================ */}
        <div className="xl:col-span-2 flex flex-col min-h-0">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar producto o escanear SKU..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white border border-neutral-300 pl-10 pr-3 py-3 text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-neutral-900 transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {cargandoProductos ? (
              <div className="py-16 text-center">
                <div className="mx-auto h-6 w-6 border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="bg-white border border-neutral-300 py-16 text-center">
                <p className="text-sm font-semibold text-neutral-700">
                  Sin productos disponibles
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {productosFiltrados.map((p) => {
                  const sinStock = p.stock <= 0;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleAgregar(p)}
                      disabled={sinStock}
                      className={`group bg-white border text-left p-4 transition-all ${
                        sinStock
                          ? 'border-neutral-200 opacity-50 cursor-not-allowed'
                          : 'border-neutral-300 hover:border-neutral-900 hover:shadow-sm'
                      }`}
                    >
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">
                        {p.sku}
                      </p>
                      <p className="text-sm font-bold text-neutral-950 leading-tight mb-3 line-clamp-2 min-h-10">
                        {p.nombre}
                      </p>
                      <div className="flex items-end justify-between">
                        <p className="text-lg font-bold text-accent-700 tabular-nums">
                          {fmtMoneda(Number(p.precio_venta))}
                        </p>
                        <div className="text-right">
                          <p className="text-[10px] font-semibold tracking-wider uppercase text-neutral-500">
                            Stock
                          </p>
                          <p
                            className={`text-sm font-bold tabular-nums ${
                              p.stock <= p.stock_minimo
                                ? 'text-rose-600'
                                : 'text-neutral-700'
                            }`}
                          >
                            {p.stock}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================
            COLUMNA 3: Carrito
            ============================================================ */}
        <aside className="flex flex-col bg-white border border-neutral-300 max-h-full">
          <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-4 w-4 text-neutral-700" />
              <div>
                <h2 className="text-sm font-bold text-neutral-950 tracking-tight">
                  Carrito
                </h2>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500">
                  {pos.lineas.length} línea{pos.lineas.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {pos.lineas.length > 0 && (
              <button
                onClick={() => {
                  pos.limpiar();
                }}
                className="text-[10px] font-bold tracking-wider uppercase text-rose-600 hover:text-rose-800"
              >
                Vaciar
              </button>
            )}
          </header>

          {pos.inferencia && pos.inferencia.alertas.length > 0 && (
            <div className="border-b border-neutral-200 p-3 space-y-2 max-h-40 overflow-y-auto">
              {pos.inferencia.alertas.map((a, i) => {
                const val = a.valor as {
                  nivel: 'ROJO' | 'AMARILLO' | 'VERDE';
                  mensaje: string;
                };
                const icono =
                  val.nivel === 'ROJO' ? (
                    <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  );
                const color =
                  val.nivel === 'ROJO'
                    ? 'border-rose-400 bg-rose-50 text-rose-900'
                    : 'border-amber-400 bg-amber-50 text-amber-900';
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-2 border-l-2 px-3 py-2 text-xs font-medium ${color}`}
                  >
                    {icono}
                    <span>{val.mensaje}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {pos.lineas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingCart className="h-8 w-8 text-neutral-300 mb-3" />
                <p className="text-sm font-semibold text-neutral-700">
                  Carrito vacío
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Agrega productos desde la izquierda
                </p>
              </div>
            ) : (
              pos.lineas.map((l) => (
                <article
                  key={l.productoId}
                  className="border border-neutral-200 p-3 bg-stone-50/50"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-neutral-900 leading-tight truncate">
                        {l.nombre}
                      </p>
                      <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                        {l.sku}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEliminar(l.productoId)}
                      className="h-6 w-6 flex items-center justify-center text-neutral-400 hover:text-rose-600 transition-colors shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCantidad(l.productoId, -1)}
                        className="h-7 w-7 border border-neutral-300 flex items-center justify-center hover:border-neutral-900 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold tabular-nums">
                        {l.cantidad}
                      </span>
                      <button
                        onClick={() => handleCantidad(l.productoId, 1)}
                        className="h-7 w-7 border border-neutral-300 flex items-center justify-center hover:border-neutral-900 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-900 tabular-nums">
                        {fmtMoneda(l.precioUnitario * l.cantidad)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <footer className="border-t border-neutral-200 p-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="tabular-nums">{fmtMoneda(pos.totales.subtotal)}</span>
              </div>
              {pos.totales.descuentos > 0 && (
                <div className="flex justify-between text-accent-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Descuentos automáticos
                  </span>
                  <span className="tabular-nums">
                    −{fmtMoneda(pos.totales.descuentos)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                <span>Total</span>
                <span className="tabular-nums">{fmtMoneda(pos.totales.total)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={
                pos.lineas.length === 0 ||
                pos.evaluando ||
                checkout.isPending
              }
              className="w-full flex items-center justify-center gap-2 bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {checkout.isPending ? 'Guardando venta...' : 'Procesar venta'}
            </button>
          </footer>
        </aside>
      </div>

      {/* Ticket modal */}
      {ticket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
            onClick={() => setTicket(null)}
          />
          <div className="relative w-full max-w-sm bg-white border border-neutral-300 p-8 text-center">
            <div className="mx-auto h-14 w-14 border-2 border-accent-600 flex items-center justify-center mb-5">
              <CheckCircle2 className="h-7 w-7 text-accent-600" />
            </div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent-700 mb-2">
              Venta registrada
            </p>
            <p className="text-2xl font-bold text-neutral-950 tracking-tight">
              {ticket.numero}
            </p>
            <p className="mt-3 text-3xl font-bold text-neutral-950 tabular-nums">
              {fmtMoneda(ticket.total)}
            </p>
            <button
              onClick={() => setTicket(null)}
              className="mt-6 w-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-accent-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}