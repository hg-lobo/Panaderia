// src/core/inference/evaluators/index.ts

import type { Condicion, EvaluadorCondicion, Hecho } from '../types';

/* ============================================================
   EVALUADOR: carrito_contiene
   Verifica que el carrito tenga todos los items de un combo
   ============================================================ */
const evaluarCarritoContiene: EvaluadorCondicion = (
  condicion: Condicion,
  hechos: readonly Hecho[],
): boolean => {
  if (condicion.tipo !== 'carrito_contiene') return false;

  const carritoHecho = hechos.find(
    (h) => h.tipo === 'carrito' && h.clave === 'actual',
  );
  if (!carritoHecho) return false;

  const carrito = carritoHecho.valor as {
    lineas: ReadonlyArray<{ productoId: string; cantidad: number }>;
  };

  const itemsRequeridos = hechos
    .filter((h) => h.tipo === 'producto' && h.clave.startsWith('combo_item:'))
    .map((h) => h.valor as { productoId: string; cantidad: number });

  if (itemsRequeridos.length === 0) return false;

  return itemsRequeridos.every((req) => {
    const enCarrito = carrito.lineas.find(
      (l) => l.productoId === req.productoId,
    );
    return (enCarrito?.cantidad ?? 0) >= req.cantidad;
  });
};

/* ============================================================
   EVALUADOR: producto
   Compara un campo del producto contra un valor o referencia
   Soporta valores especiales: "hoy+7d", "hoy+30d", "stock_minimo"
   ============================================================ */
const evaluarProducto: EvaluadorCondicion = (
  condicion: Condicion,
  hechos: readonly Hecho[],
): boolean => {
  if (condicion.tipo !== 'producto') return false;

  const productos = hechos.filter(
    (h) => h.tipo === 'producto' && !h.clave.startsWith('combo_item:'),
  );
  if (productos.length === 0) return false;

  return productos.some((hechoProducto) => {
    const producto = hechoProducto.valor as Record<string, unknown>;
    const valorProducto = producto[condicion.campo];
    const valorRegla = resolverValor(condicion.valor, producto);

    return comparar(valorProducto, condicion.operador, valorRegla);
  });
};

function resolverValor(valor: unknown, producto: Record<string, unknown>): unknown {
  if (typeof valor !== 'string') return valor;

  // "hoy+7d" → fecha ISO dentro de 7 días
  const matchHoy = valor.match(/^hoy\+(\d+)d$/);
  if (matchHoy) {
    const dias = parseInt(matchHoy[1] ?? '0', 10);
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
  }

  // "stock_minimo" → valor del propio producto
  if (valor in producto) return producto[valor];

  return valor;
}

function comparar(a: unknown, op: string, b: unknown): boolean {
  const numA =
    typeof a === 'string' && !isNaN(Date.parse(a))
      ? Date.parse(a)
      : Number(a);
  const numB =
    typeof b === 'string' && !isNaN(Date.parse(b))
      ? Date.parse(b)
      : Number(b);

  switch (op) {
    case '<=': return numA <= numB;
    case '>=': return numA >= numB;
    case '<':  return numA <  numB;
    case '>':  return numA >  numB;
    case '=':  return numA === numB;
    default:   return false;
  }
}

/* ============================================================
   EVALUADOR: siempre
   ============================================================ */
const evaluarSiempre: EvaluadorCondicion = (condicion) =>
  condicion.tipo === 'siempre';

/* ============================================================
   REGISTRO CENTRAL
   ============================================================ */
export const EVALUADORES: ReadonlyMap<string, EvaluadorCondicion> = new Map([
  ['carrito_contiene', evaluarCarritoContiene],
  ['producto', evaluarProducto],
  ['siempre', evaluarSiempre],
]);