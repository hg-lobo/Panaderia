// src/core/inference/executors/index.ts

import type { Accion, EjecutorAccion, Hecho } from '../types';

/* ============================================================
   EJECUTOR: aplicar_descuento
   Extrae el monto del combo actual y lo registra como hecho
   ============================================================ */
const ejecutarAplicarDescuento: EjecutorAccion = (
  accion: Accion,
  hechos: readonly Hecho[],
): readonly Hecho[] => {
  if (accion.tipo !== 'aplicar_descuento') return [];

  const comboHecho = hechos.find(
    (h) => h.tipo === 'producto' && h.clave.startsWith('combo:'),
  );
  if (!comboHecho) return [];

  const combo = comboHecho.valor as {
    id: string;
    nombre: string;
    montoDescuento: number;
  };

  const nuevoHecho: Hecho = {
    tipo: 'descuento',
    clave: `descuento:combo:${combo.id}`,
    valor: {
      fuente: 'combo',
      comboId: combo.id,
      comboNombre: combo.nombre,
      monto: combo.montoDescuento,
      motivo: `Combo "${combo.nombre}" aplicado automáticamente`,
    },
  };

  return [nuevoHecho];
};

/* ============================================================
   EJECUTOR: alerta
   Genera una alerta visual para el cajero
   ============================================================ */
const ejecutarAlerta: EjecutorAccion = (
  accion: Accion,
  hechos: readonly Hecho[],
): readonly Hecho[] => {
  if (accion.tipo !== 'alerta') return [];

  const productoAfectado = hechos.find(
    (h) => h.tipo === 'producto' && !h.clave.startsWith('combo'),
  );

  const nuevoHecho: Hecho = {
    tipo: 'alerta',
    clave: `alerta:${accion.nivel}:${productoAfectado?.clave ?? 'global'}:${Date.now()}`,
    valor: {
      nivel: accion.nivel,
      mensaje: accion.mensaje,
      productoId: productoAfectado?.clave,
      bloqueo: false,
    },
  };

  return [nuevoHecho];
};

/* ============================================================
   EJECUTOR: bloquear_venta
   ============================================================ */
const ejecutarBloquearVenta: EjecutorAccion = (
  accion: Accion,
): readonly Hecho[] => {
  if (accion.tipo !== 'bloquear_venta') return [];

  return [{
    tipo: 'alerta',
    clave: `bloqueo:${Date.now()}`,
    valor: {
      nivel: 'ROJO',
      mensaje: accion.motivo,
      bloqueo: true,
    },
  }];
};

/* ============================================================
   REGISTRO CENTRAL
   ============================================================ */
export const EJECUTORES: ReadonlyMap<string, EjecutorAccion> = new Map([
  ['aplicar_descuento', ejecutarAplicarDescuento],
  ['alerta',            ejecutarAlerta],
  ['bloquear_venta',    ejecutarBloquearVenta],
]);