// src/core/domain/schemas/producto.schema.ts

import { z } from 'zod';

/* ============================================================
   SCHEMA DE PRODUCTO
   Nota: los numéricos usan z.number() puro. La conversión desde
   el input HTML se hace con valueAsNumber en el register.
   ============================================================ */
export const productoSchema = z
  .object({
    sku: z
      .string()
      .min(1, 'El SKU es obligatorio')
      .max(64, 'Máximo 64 caracteres')
      .regex(/^[A-Z0-9-]+$/, 'Solo mayúsculas, números y guiones'),
    nombre: z
      .string()
      .min(2, 'Mínimo 2 caracteres')
      .max(200, 'Máximo 200 caracteres'),
    descripcion: z.string().max(500).nullable().optional(),
    categoria_id: z.string().min(1, 'Selecciona una categoría'),
    precio_costo: z
      .number({ message: 'Debe ser un número' })
      .min(0, 'No puede ser negativo'),
    precio_venta: z
      .number({ message: 'Debe ser un número' })
      .min(0.01, 'Debe ser mayor a 0'),
    stock: z
      .number({ message: 'Debe ser un número' })
      .int('Debe ser entero')
      .min(0, 'No puede ser negativo'),
    stock_minimo: z
      .number({ message: 'Debe ser un número' })
      .int('Debe ser entero')
      .min(0, 'No puede ser negativo'),
    fecha_vencimiento: z.string().nullable().optional(),
  })
  .refine((d) => d.precio_venta >= d.precio_costo, {
    message: 'El precio de venta debe ser mayor o igual al costo',
    path: ['precio_venta'],
  });

export type ProductoInput = z.infer<typeof productoSchema>;

/* ============================================================
   SCHEMA DE COMBO
   ============================================================ */
export const comboSchema = z
  .object({
    nombre: z
      .string()
      .min(2, 'Mínimo 2 caracteres')
      .max(200, 'Máximo 200 caracteres'),
    descripcion: z.string().max(500).nullable().optional(),
    tipo_descuento: z.enum(['PRECIO_FIJO', 'PORCENTAJE']),
    valor_descuento: z
      .number({ message: 'Debe ser un número' })
      .min(0.01, 'Debe ser mayor a 0'),
    estado: z.enum(['ACTIVO', 'INACTIVO', 'VENCIDO']).default('ACTIVO'),
    fecha_fin: z.string().nullable().optional(),
    items: z
      .array(
        z.object({
          producto_id: z.string().uuid(),
          cantidad: z.number().int().min(1, 'Mínimo 1'),
        }),
      )
      .min(2, 'Un combo debe tener al menos 2 productos'),
  })
  .refine(
    (d) => d.tipo_descuento !== 'PORCENTAJE' || d.valor_descuento <= 100,
    {
      message: 'El porcentaje no puede superar 100',
      path: ['valor_descuento'],
    },
  );

export type ComboInput = z.infer<typeof comboSchema>;