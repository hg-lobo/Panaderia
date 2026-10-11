// src/features/panel/components/ProductoForm.tsx

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, AlertCircle } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import {
  productoSchema, type ProductoInput,
} from '@/core/domain/schemas/producto.schema';
import {
  useCrearProducto, useActualizarProducto,
} from '@/infrastructure/supabase/queries/productos.mutations';
import type { Producto, Categoria } from '@/infrastructure/types/database.types';

interface ProductoFormProps {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly producto: Producto | null;
  readonly categorias: readonly Categoria[];
}

export function ProductoForm({
  abierto, onCerrar, producto, categorias,
}: ProductoFormProps) {
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const esEdicion = producto !== null;

  const form = useForm<ProductoInput>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      sku: '',
      nombre: '',
      descripcion: '',
      categoria_id: '',
      precio_costo: 0,
      precio_venta: 0,
      stock: 0,
      stock_minimo: 5,
      fecha_vencimiento: null,
    },
  });

  useEffect(() => {
    if (!abierto) return;
    if (producto) {
      form.reset({
        sku: producto.sku,
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? '',
        categoria_id: producto.categoria_id,
        precio_costo: Number(producto.precio_costo),
        precio_venta: Number(producto.precio_venta),
        stock: producto.stock,
        stock_minimo: producto.stock_minimo,
        fecha_vencimiento: producto.fecha_vencimiento ?? null,
      });
    } else {
      form.reset({
        sku: '',
        nombre: '',
        descripcion: '',
        categoria_id: categorias[0]?.id ?? '',
        precio_costo: 0,
        precio_venta: 0,
        stock: 0,
        stock_minimo: 5,
        fecha_vencimiento: null,
      });
    }
  }, [abierto, producto, categorias, form]);

  const onSubmit = async (data: ProductoInput) => {
    const payload = {
      sku: data.sku,
      nombre: data.nombre,
      descripcion: data.descripcion?.trim() || null,
      categoria_id: data.categoria_id,
      precio_costo: Number(data.precio_costo),
      precio_venta: Number(data.precio_venta),
      stock: Number(data.stock),
      stock_minimo: Number(data.stock_minimo),
      fecha_vencimiento: data.fecha_vencimiento || null,
    };

    try {
      if (esEdicion && producto) {
        await actualizar.mutateAsync({ id: producto.id, cambios: payload });
      } else {
        await crear.mutateAsync(payload);
      }
      onCerrar();
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Error al guardar',
      });
    }
  };

  const errorGlobal = form.formState.errors.root?.message;
  const guardando = crear.isPending || actualizar.isPending;

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={esEdicion ? 'Editar producto' : 'Nuevo producto'}
      subtitulo={esEdicion ? 'Modificar datos existentes' : 'Agregar al catálogo'}
      ancho="lg"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Campo
            label="SKU"
            placeholder="CAF-001"
            error={form.formState.errors.sku?.message}
            {...form.register('sku')}
          />
          <Campo
            label="Nombre"
            placeholder="Café Americano"
            error={form.formState.errors.nombre?.message}
            {...form.register('nombre')}
          />
        </div>

        <Campo
          label="Descripción (opcional)"
          placeholder="Detalles del producto"
          error={form.formState.errors.descripcion?.message}
          {...form.register('descripcion')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-2">
              Categoría
            </label>
            <select
              {...form.register('categoria_id')}
              className="w-full bg-white border border-neutral-400 px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors"
            >
              <option value="">Selecciona</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {form.formState.errors.categoria_id && (
              <p className="mt-1 text-xs text-rose-600 font-medium">
                {form.formState.errors.categoria_id.message}
              </p>
            )}
          </div>
          <Campo
            label="Fecha de vencimiento (opcional)"
            type="date"
            error={form.formState.errors.fecha_vencimiento?.message}
            {...form.register('fecha_vencimiento')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Campo
            label="Precio costo"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={form.formState.errors.precio_costo?.message}
            {...form.register('precio_costo', { valueAsNumber: true })}
          />
          <Campo
            label="Precio venta"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={form.formState.errors.precio_venta?.message}
            {...form.register('precio_venta', { valueAsNumber: true })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Campo
            label="Stock actual"
            type="number"
            placeholder="0"
            error={form.formState.errors.stock?.message}
            {...form.register('stock', { valueAsNumber: true })}
          />
          <Campo
            label="Stock mínimo"
            type="number"
            placeholder="5"
            error={form.formState.errors.stock_minimo?.message}
            {...form.register('stock_minimo', { valueAsNumber: true })}
          />
        </div>

        {errorGlobal && (
          <div className="flex items-start gap-3 border-l-2 border-rose-500 bg-rose-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-900 font-medium">{errorGlobal}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-950 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="flex items-center gap-2 bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {guardando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear producto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface CampoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Campo({ label, error, ...rest }: CampoProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-800 mb-2">
        {label}
      </label>
      <input
        {...rest}
        className={`w-full bg-white border ${
          error
            ? 'border-rose-400 focus:border-rose-600'
            : 'border-neutral-400 focus:border-neutral-900'
        } px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none transition-colors`}
      />
      {error && (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
}