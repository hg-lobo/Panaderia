// src/infrastructure/supabase/queries/categorias.queries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';
import type { Categoria } from '../../types/database.types';

export function useCategorias() {
  return useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('activa', true)
        .order('nombre', { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as Categoria[];
    },
  });
}

export function useCrearCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nombre: string;
      descripcion: string | null;
    }): Promise<Categoria> => {
      const { data, error } = await supabase
        .from('categorias')
        .insert(input)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Categoria;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}