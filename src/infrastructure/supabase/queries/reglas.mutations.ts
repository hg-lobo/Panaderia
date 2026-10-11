// src/infrastructure/supabase/queries/reglas.mutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { ReglaNegocio } from '../../types/database.types';

export interface CrearReglaInput {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: 'COMBO' | 'VENCIMIENTO' | 'STOCK' | 'PRECIO' | 'POLITICA';
  condicion: Record<string, unknown>;
  accion: Record<string, unknown>;
  prioridad: number;
  activa: boolean;
}

export function useCrearRegla() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CrearReglaInput): Promise<ReglaNegocio> => {
      const { data, error } = await supabase
        .from('reglas_negocio')
        .insert(input)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ReglaNegocio;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reglas-activas'] });
    },
  });
}

export function useActualizarRegla() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id, cambios,
    }: {
      id: string;
      cambios: Partial<CrearReglaInput>;
    }): Promise<ReglaNegocio> => {
      const { data, error } = await supabase
        .from('reglas_negocio')
        .update(cambios)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as ReglaNegocio;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reglas-activas'] });
    },
  });
}

export function useToggleRegla() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, activa }: { id: string; activa: boolean }) => {
      const { error } = await supabase
        .from('reglas_negocio')
        .update({ activa })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reglas-activas'] });
    },
  });
}