// src/core/inference/types.ts

/* ============================================================
   TIPOS DEL MOTOR DE INFERENCIA
   ============================================================ */

/** Hecho: observación atómica sobre el estado actual */
export interface Hecho {
  readonly tipo: 'carrito' | 'producto' | 'venta' | 'sesion' | 'descuento' | 'alerta';
  readonly clave: string;
  readonly valor: unknown;
}

/** Condición evaluable (viene del JSONB `reglas_negocio.condicion`) */
export type Condicion =
  | { tipo: 'carrito_contiene'; comboId: string; itemsCompletos: boolean }
  | { tipo: 'producto'; campo: string; operador: '<=' | '>=' | '=' | '<' | '>'; valor: unknown }
  | { tipo: 'siempre' };

/** Acción ejecutable (viene del JSONB `reglas_negocio.accion`) */
export type Accion =
  | { tipo: 'aplicar_descuento'; fuente: 'combo' | 'manual'; campo: string }
  | { tipo: 'alerta'; nivel: 'ROJO' | 'AMARILLO' | 'VERDE'; mensaje: string }
  | { tipo: 'bloquear_venta'; motivo: string };

/** Regla de producción cargada desde BD */
export interface Regla {
  readonly id: string;
  readonly codigo: string;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly categoria: 'COMBO' | 'VENCIMIENTO' | 'STOCK' | 'PRECIO' | 'POLITICA';
  readonly condicion: Condicion;
  readonly accion: Accion;
  readonly prioridad: number;
}

/** Traza de una regla disparada (explicabilidad) */
export interface ReglaDisparada {
  readonly regla: Regla;
  readonly hechosEntrada: readonly Hecho[];
  readonly hechosSalida: readonly Hecho[];
  readonly justificacion: string;
}

/** Resultado completo del ciclo de inferencia */
export interface ResultadoInferencia {
  readonly hechos: readonly Hecho[];
  readonly traza: readonly ReglaDisparada[];
  readonly descuentoTotal: number;
  readonly alertas: readonly Hecho[];
  readonly bloqueos: readonly Hecho[];
}

/** Función evaluadora: determina si una condición se cumple */
export type EvaluadorCondicion = (
  condicion: Condicion,
  hechos: readonly Hecho[],
) => boolean;

/** Función ejecutora: aplica una acción y genera hechos nuevos */
export type EjecutorAccion = (
  accion: Accion,
  hechos: readonly Hecho[],
) => readonly Hecho[];