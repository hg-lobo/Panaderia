// src/core/inference/inference.service.ts

import { supabase } from '@/infrastructure/supabase/client';
import { ForwardChainingEngine } from './forward-chaining.engine';
import { EVALUADORES } from './evaluators';
import { EJECUTORES } from './executors';
import type { Hecho, Regla, ResultadoInferencia } from './types';

/**
 * Orquestador del sistema experto.
 *
 * HOW: Carga reglas activas desde Supabase (fn_reglas_activas) y ejecuta
 *      el motor de inferencia sobre los hechos del carrito actual.
 *
 * WHY: El motor es puro (no toca BD). Este servicio es la frontera entre
 *      el dominio (motor) y la infraestructura (Supabase).
 */
export class InferenceService {
  private reglasCache: readonly Regla[] | null = null;

  public async cargarReglas(): Promise<readonly Regla[]> {
    if (this.reglasCache !== null) return this.reglasCache;

    const { data, error } = await supabase.rpc('fn_reglas_activas');
    if (error) throw new Error(`Error cargando reglas: ${error.message}`);

    const reglasMapeadas: Regla[] = (data ?? []).map((r: {
      id: string;
      codigo: string;
      nombre: string;
      descripcion: string | null;
      categoria: string;
      condicion: Record<string, unknown>;
      accion: Record<string, unknown>;
      prioridad: number;
    }): Regla => ({
      id: r.id,
      codigo: r.codigo,
      nombre: r.nombre,
      descripcion: r.descripcion,
      categoria: r.categoria as Regla['categoria'],
      condicion: r.condicion as Regla['condicion'],
      accion: r.accion as Regla['accion'],
      prioridad: r.prioridad,
    }));

    this.reglasCache = reglasMapeadas;
    return reglasMapeadas;
  }

  public invalidarCache(): void {
    this.reglasCache = null;
  }

  public async inferir(hechos: readonly Hecho[]): Promise<ResultadoInferencia> {
    const reglas = await this.cargarReglas();
    const motor = new ForwardChainingEngine(reglas, EVALUADORES, EJECUTORES);
    return motor.inferir(hechos);
  }
}

/** Instancia singleton del servicio */
export const inferenceService = new InferenceService();