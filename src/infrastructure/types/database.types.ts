// src/infrastructure/types/database.types.ts

/* ============================================================
   TIPOS DE LA BASE DE DATOS — Sistema Experto POS
   Reflejan 1:1 el esquema de Supabase
   ============================================================ */

export type RolUsuario = 'ADMIN';
export type EstadoVenta = 'PAGADA' | 'ANULADA' | 'PENDIENTE';
export type EstadoCombo = 'ACTIVO' | 'INACTIVO' | 'VENCIDO';
export type TipoDescuento = 'PRECIO_FIJO' | 'PORCENTAJE';
export type CategoriaRegla = 'COMBO' | 'VENCIMIENTO' | 'STOCK' | 'PRECIO' | 'POLITICA';
export type NivelAlerta = 'ROJO' | 'AMARILLO' | 'VERDE';

export interface Perfil {
  id: string;
  nombre_completo: string;
  rol: RolUsuario;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  created_at: string;
}

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string | null;
  categoria_id: string;
  precio_costo: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  fecha_vencimiento: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Combo {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo_descuento: TipoDescuento;
  valor_descuento: number;
  estado: EstadoCombo;
  fecha_inicio: string;
  fecha_fin: string | null;
  created_at: string;
}

export interface ComboItem {
  id: string;
  combo_id: string;
  producto_id: string;
  cantidad: number;
}

export interface Venta {
  id: string;
  numero_factura: string;
  cajero_id: string;
  subtotal: number;
  descuentos: number;
  impuestos: number;
  total: number;
  estado: EstadoVenta;
  created_at: string;
}

export interface DetalleVenta {
  id: string;
  venta_id: string;
  producto_id: string;
  combo_id: string | null;
  cantidad: number;
  precio_unitario: number;
  precio_costo_unitario: number;
  descuento_linea: number;
  subtotal_linea: number;
}

export interface Devolucion {
  id: string;
  detalle_id: string;
  cantidad: number;
  motivo: string;
  monto_reembolso: number;
  cajero_id: string;
  created_at: string;
}

export interface ReglaNegocio {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: CategoriaRegla;
  condicion: Record<string, unknown>;
  accion: Record<string, unknown>;
  prioridad: number;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface InferenciaLog {
  id: string;
  venta_id: string | null;
  regla_id: string;
  regla_codigo: string;
  hechos_entrada: Record<string, unknown>;
  hechos_salida: Record<string, unknown>;
  justificacion: string | null;
  created_at: string;
}

/* ============================================================
   Tipos derivados / de vistas
   ============================================================ */

export interface KPIsDashboard {
  total_productos_vendidos: number;
  total_facturas: number;
  total_transacciones: number;
  ganancia_neta: number;
}

export interface ProductoPorVencer {
  id: string;
  sku: string;
  nombre: string;
  stock: number;
  fecha_vencimiento: string;
  dias_restantes: number;
}

export interface VentaDiaria {
  fecha: string;
  ingresos: number;
  utilidad: number;
  facturas: number;
}