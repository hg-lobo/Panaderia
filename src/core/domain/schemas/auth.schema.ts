// src/core/domain/schemas/auth.schema.ts

import { z } from 'zod';

/* ============================================================
   LOGIN
   ============================================================ */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/* ============================================================
   REGISTRO
   ============================================================ */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'El correo es obligatorio')
      .email('Correo electrónico inválido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/* ============================================================
   RECUPERAR CONTRASEÑA (envío de email)
   ============================================================ */
export const recuperarSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Correo electrónico inválido'),
});

export type RecuperarInput = z.infer<typeof recuperarSchema>;

/* ============================================================
   CAMBIAR CONTRASEÑA (desde el perfil)
   ============================================================ */
export const cambiarPasswordSchema = z
  .object({
    passwordActual: z.string().min(1, 'Ingresa tu contraseña actual'),
    passwordNueva: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmarPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((data) => data.passwordNueva === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  })
  .refine((data) => data.passwordActual !== data.passwordNueva, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['passwordNueva'],
  });

export type CambiarPasswordInput = z.infer<typeof cambiarPasswordSchema>;

/* ============================================================
   NUEVA CONTRASEÑA (después del reset por email)
   ============================================================ */
export const nuevaPasswordSchema = z
  .object({
    passwordNueva: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmarPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((data) => data.passwordNueva === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  });

export type NuevaPasswordInput = z.infer<typeof nuevaPasswordSchema>;