// src/features/panel/ProductosPage.tsx

import { useMemo, useState } from 'react';
import {
  Plus, Search, Package, MoreVertical,
  Pencil, PowerOff, Power,
} from 'lucide-react';
import { useProductos } from '@/infrastructure/supabase/queries/dashboard.queries';
import { useCategorias } from '@/infrastructure/supabase/queries/categorias.queries';
import {
  useDesactivarProducto, useReactivarProducto,
} from '@/infrastructure/supabase/queries/productos.mutations';
import { ProductoForm } from '../panel/components/ProductoForm';
import type { Producto } from '@/infrastructure/types/database.types';

export function ProductosPage() {
  const { data: productos = [], isLoading } = useProductos();
  const { data: categorias = [] } = useCategorias();
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [formAbierto, setFormAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);

  const desactivar = useDesactivarProducto();
  const reactivar = useReactivarProducto();

  const filtrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideBusqueda =
        busqueda.trim() === '' ||
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sku.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria =
        filtroCategoria === 'todas' || p.categoria_id === filtroCategoria;
      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, filtroCategoria]);

  const nombreCategoria = (id: string) =>
    categorias.find((c) => c.id === id)?.nombre ?? '—';

  const fmtMoneda = (n: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(n);

  const abrirCrear = () => {
    setProductoEditar(null);
    setFormAbierto(true);
  };

  const abrirEditar = (p: Producto) => {
    setProductoEditar(p);
    setFormAbierto(true);
    setMenuAbierto(null);
  };

  const cerrarForm = () => {
    setFormAbierto(false);
    setProductoEditar(null);
  };

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y crear */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white border border-neutral-300 pl-10 pr-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-neutral-900 transition-colors"
          />
        </div>

        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="bg-white border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white border border-neutral-300">
        <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-neutral-700" />
            <div>
              <h2 className="text-sm font-bold text-neutral-950 tracking-tight">
                Catálogo de productos
              </h2>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500">
                {filtrados.length} productos
              </p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-6 w-6 border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="mx-auto h-8 w-8 text-neutral-300 mb-3" />
            <p className="text-sm font-semibold text-neutral-700">
              Sin productos
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {busqueda || filtroCategoria !== 'todas'
                ? 'Ajusta los filtros de búsqueda'
                : 'Crea tu primer producto para empezar'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                    SKU
                  </th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                    Producto
                  </th>
                  <th className="text-left px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                    Categoría
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                    Precio
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                    Stock
                  </th>
                  <th className="text-center px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-600">
                    Estado
                  </th>
                  <th className="w-12 px-3" />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => {
                  const stockBajo = p.stock <= p.stock_minimo;
                  const vencido =
                    p.fecha_vencimiento &&
                    new Date(p.fecha_vencimiento) < new Date();
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50"
                    >
                      <td className="px-6 py-3 font-mono text-xs text-neutral-500">
                        {p.sku}
                      </td>
                      <td className="px-6 py-3">
                        <p className="font-medium text-neutral-900">{p.nombre}</p>
                        {vencido && (
                          <span className="text-[10px] font-bold tracking-wider uppercase text-rose-700">
                            Vencido
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-neutral-600">
                        {nombreCategoria(p.categoria_id)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-neutral-900 font-medium">
                        {fmtMoneda(Number(p.precio_venta))}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span
                          className={`tabular-nums font-semibold ${
                            stockBajo ? 'text-rose-700' : 'text-neutral-900'
                          }`}
                        >
                          {p.stock}
                        </span>
                        {stockBajo && (
                          <span className="block text-[10px] font-bold tracking-wider uppercase text-rose-700">
                            Bajo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border ${
                            p.activo
                              ? 'bg-accent-50 text-accent-800 border-accent-200'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                          }`}
                        >
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-3 relative">
                        <button
                          onClick={() =>
                            setMenuAbierto(
                              menuAbierto === p.id ? null : p.id,
                            )
                          }
                          className="h-8 w-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {menuAbierto === p.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuAbierto(null)}
                            />
                            <div className="absolute right-3 top-11 z-20 w-44 bg-white border border-neutral-300 shadow-lg">
                              <button
                                onClick={() => abrirEditar(p)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 text-left"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Editar
                              </button>
                              {p.activo ? (
                                <button
                                  onClick={() => {
                                    desactivar.mutate(p.id);
                                    setMenuAbierto(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-700 hover:bg-rose-50 text-left border-t border-neutral-100"
                                >
                                  <PowerOff className="h-3.5 w-3.5" />
                                  Desactivar
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    reactivar.mutate(p.id);
                                    setMenuAbierto(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-accent-700 hover:bg-accent-50 text-left border-t border-neutral-100"
                                >
                                  <Power className="h-3.5 w-3.5" />
                                  Reactivar
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      <ProductoForm
        abierto={formAbierto}
        onCerrar={cerrarForm}
        producto={productoEditar}
        categorias={categorias}
      />
    </div>
  );
}