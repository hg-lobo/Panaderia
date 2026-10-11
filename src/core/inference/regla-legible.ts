// src/core/inference/regla-legible.ts

import type { ReglaNegocio } from '@/infrastructure/types/database.types';

/**
 * Traduce una regla técnica a un resumen en lenguaje natural.
 * El usuario final no necesita ver JSON ni nombres de campo.
 */
export function describirRegla(regla: ReglaNegocio): string {
  const cond = regla.condicion as Record<string, unknown>;
  const acc = regla.accion as Record<string, unknown>;

  const condicionTexto = traducirCondicion(cond, regla);
  const accionTexto = traducirAccion(acc);

  return `Cuando ${condicionTexto}, ${accionTexto}.`;
}

function traducirCondicion(
  cond: Record<string, unknown>,
  regla: ReglaNegocio,
): string {
  const tipo = cond.tipo as string | undefined;

  // Combos: no hace falta detalle porque el nombre lo dice
  if (tipo === 'carrito_contiene') {
    return 'el cliente lleve todos los productos de un combo';
  }

  // Productos: por categoría de regla
  if (tipo === 'producto') {
    const campo = cond.campo as string;
    const operador = cond.operador as string;
    const valor = cond.valor;

    // Casos especiales por categoría
    if (regla.categoria === 'VENCIMIENTO') {
      const dias = extraerDias(valor);
      if (operador === '<=' && dias !== null) {
        return `falten ${dias} días o menos para que un producto venza`;
      }
      return 'un producto esté próximo a vencer';
    }

    if (regla.categoria === 'STOCK') {
      // Si el valor es "stock_minimo" (string), traducir a lenguaje natural
      if (valor === 'stock_minimo') {
        return 'las unidades disponibles bajen del mínimo configurado';
      }
      if (typeof valor === 'number') {
        return `queden ${valor} unidades o menos de un producto`;
      }
      return 'el stock de un producto esté bajo';
    }

    if (regla.categoria === 'POLITICA') {
      if (campo === 'stock' && operador === '=' && valor === 0) {
        return 'un producto se haya agotado por completo';
      }
    }

    // Fallback genérico
    const campoTxt = traducirCampo(campo);
    const valorTxt = traducirValor(valor);
    return `${campoTxt} sea ${traducirOperador(operador)} ${valorTxt}`;
  }

  if (tipo === 'siempre') return 'se cumpla la condición base';

  return 'se cumplan las condiciones configuradas';
}

function traducirAccion(acc: Record<string, unknown>): string {
  const tipo = acc.tipo as string | undefined;

  if (tipo === 'aplicar_descuento') {
    return 'el sistema aplica el descuento automáticamente';
  }

  if (tipo === 'alerta') {
    const nivel = acc.nivel as string;
    const mensaje = (acc.mensaje as string) ?? 'Alerta';

    // Traducción del nivel sin palabras técnicas
    const nivelTxt =
      nivel === 'ROJO'
        ? 'una alerta importante'
        : nivel === 'AMARILLO'
          ? 'un aviso'
          : 'un aviso suave';

    return `el sistema te muestra ${nivelTxt}: "${mensaje}"`;
  }

  if (tipo === 'bloquear_venta') {
    return 'el sistema impide completar la venta';
  }

  return 'el sistema ejecuta la acción';
}

function traducirCampo(campo: string): string {
  const mapa: Record<string, string> = {
    stock: 'el stock',
    stock_minimo: 'el stock mínimo',
    precio_venta: 'el precio de venta',
    precio_costo: 'el precio de costo',
    fecha_vencimiento: 'la fecha de vencimiento',
  };
  return mapa[campo] ?? `el campo ${campo}`;
}

function traducirOperador(op: string): string {
  const mapa: Record<string, string> = {
    '<=': 'menor o igual a',
    '>=': 'mayor o igual a',
    '<': 'menor a',
    '>': 'mayor a',
    '=': 'igual a',
  };
  return mapa[op] ?? op;
}

function traducirValor(valor: unknown): string {
  if (typeof valor !== 'string') return String(valor);
  const matchHoy = valor.match(/^hoy\+(\d+)d$/);
  if (matchHoy) return `${matchHoy[1]} días desde hoy`;
  return valor;
}

function extraerDias(valor: unknown): number | null {
  if (typeof valor !== 'string') return null;
  const match = valor.match(/^hoy\+(\d+)d$/);
  return match ? parseInt(match[1] ?? '0', 10) : null;
}

/**
 * Devuelve un ícono lucide basado en la categoría.
 */
export function categoriaMeta(categoria: string): {
  label: string;
  color: string;
  bg: string;
} {
  switch (categoria) {
    case 'COMBO':
      return {
        label: 'Combos',
        color: 'text-accent-800',
        bg: 'bg-accent-50 border-accent-200',
      };
    case 'VENCIMIENTO':
      return {
        label: 'Vencimiento',
        color: 'text-amber-800',
        bg: 'bg-amber-50 border-amber-200',
      };
    case 'STOCK':
      return {
        label: 'Stock',
        color: 'text-rose-800',
        bg: 'bg-rose-50 border-rose-200',
      };
    case 'PRECIO':
      return {
        label: 'Precio',
        color: 'text-neutral-800',
        bg: 'bg-neutral-100 border-neutral-300',
      };
    case 'POLITICA':
      return {
        label: 'Política',
        color: 'text-neutral-800',
        bg: 'bg-neutral-100 border-neutral-300',
      };
    default:
      return {
        label: categoria,
        color: 'text-neutral-800',
        bg: 'bg-neutral-100 border-neutral-300',
      };
  }
}