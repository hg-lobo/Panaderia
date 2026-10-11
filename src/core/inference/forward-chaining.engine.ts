// src/core/inference/forward-chaining.engine.ts

import type {
  Hecho, Regla, ReglaDisparada, ResultadoInferencia,
  EvaluadorCondicion, EjecutorAccion,
} from './types';

/**
 * Motor de inferencia con encadenamiento hacia adelante.
 *
 * HOW: Itera reglas ordenadas por prioridad. Si la condición se cumple,
 *      ejecuta la acción, agrega hechos nuevos y REINICIA el ciclo.
 *      Termina cuando ninguna regla dispara o se alcanza el límite.
 *
 * WHY: El POS parte de hechos conocidos (carrito) y quiere derivar
 *      conclusiones (descuentos, alertas, bloqueos). Forward chaining
 *      es el patrón correcto para este flujo.
 */
export class ForwardChainingEngine {
  private readonly reglas: readonly Regla[];
  private readonly evaluadores: ReadonlyMap<string, EvaluadorCondicion>;
  private readonly ejecutores: ReadonlyMap<string, EjecutorAccion>;
  private readonly maxIteraciones: number;

  constructor(
    reglas: readonly Regla[],
    evaluadores: ReadonlyMap<string, EvaluadorCondicion>,
    ejecutores: ReadonlyMap<string, EjecutorAccion>,
    maxIteraciones = 100,
  ) {
    this.reglas = [...reglas].sort((a, b) => b.prioridad - a.prioridad);
    this.evaluadores = evaluadores;
    this.ejecutores = ejecutores;
    this.maxIteraciones = maxIteraciones;
  }

  public inferir(hechosIniciales: readonly Hecho[]): ResultadoInferencia {
    let hechos: Hecho[] = [...hechosIniciales];
    const traza: ReglaDisparada[] = [];
    let iteraciones = 0;

    let disparo = true;
    while (disparo && iteraciones++ < this.maxIteraciones) {
      disparo = false;

      for (const regla of this.reglas) {
        const evaluador = this.evaluadores.get(regla.condicion.tipo);
        if (!evaluador) continue;

        const cumple = evaluador(regla.condicion, hechos);
        if (!cumple) continue;

        // Evitar re-disparo infinito de la misma regla
        if (this.yaDisparada(traza, regla.id)) continue;

        const ejecutor = this.ejecutores.get(regla.accion.tipo);
        if (!ejecutor) continue;

        const hechosEntrada = [...hechos];
        const hechosNuevos = ejecutor(regla.accion, hechos);
        hechos = [...hechos, ...hechosNuevos];

        traza.push({
          regla,
          hechosEntrada,
          hechosSalida: hechosNuevos,
          justificacion: this.construirJustificacion(regla, hechosNuevos),
        });

        disparo = true;
        break;
      }
    }

    return this.consolidar(hechos, traza);
  }

  private yaDisparada(traza: readonly ReglaDisparada[], reglaId: string): boolean {
    return traza.some((t) => t.regla.id === reglaId);
  }

  private construirJustificacion(regla: Regla, hechos: readonly Hecho[]): string {
    const resumen = hechos
      .map((h) => `${h.clave}=${JSON.stringify(h.valor)}`)
      .join(', ');
    return `Regla "${regla.codigo}" (prioridad ${regla.prioridad}) disparó → ${resumen}`;
  }

  private consolidar(
    hechos: readonly Hecho[],
    traza: readonly ReglaDisparada[],
  ): ResultadoInferencia {
    const descuentos = hechos.filter((h) => h.tipo === 'descuento');
    const alertas = hechos.filter((h) => h.tipo === 'alerta');

    const descuentoTotal = descuentos.reduce((acc, h) => {
      const valor = h.valor as { monto?: number };
      return acc + (valor.monto ?? 0);
    }, 0);

    const bloqueos = hechos.filter(
      (h) => h.tipo === 'alerta' && (h.valor as { bloqueo?: boolean }).bloqueo === true,
    );

    return { hechos, traza, descuentoTotal, alertas, bloqueos };
  }
}