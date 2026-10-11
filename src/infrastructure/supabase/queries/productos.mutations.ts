// src/infrastructure/supabase/queries/productos.mutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Producto } from '../../types/database.types';

/* ============================================================
   CREAR PRODUCTO
   ============================================================ */
export interface CrearProductoInput {
  sku: string;
  nombre: string;
  descripcion: string | null;
  categoria_id: string;
  precio_costo: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  fecha_vencimiento: string | null;
}

export function useCrearProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CrearProductoInput): Promise<Producto> => {
      const { data, error } = await supabase
        .from('productos')
        .insert(input)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Producto;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] });
      qc.invalidateQueries({ queryKey: ['vencimientos'] });
    },
  });
}

/* ============================================================
   ACTUALIZAR PRODUCTO
   ============================================================ */
export function useActualizarProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id, cambios,
    }: {
      id: string;
      cambios: Partial<CrearProductoInput>;
    }): Promise<Producto> => {
      const { data, error } = await supabase
        .from('productos')
        .update(cambios)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Producto;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] });
      qc.invalidateQueries({ queryKey: ['vencimientos'] });
    },
  });
}

/* ============================================================
   DESACTIVAR PRODUCTO (soft delete)
   ============================================================ */
export function useDesactivarProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('productos')
        .update({ activo: false })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

/* ============================================================
   REACTIVAR PRODUCTO
   ============================================================ */
export function useReactivarProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('productos')
        .update({ activo: true })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}