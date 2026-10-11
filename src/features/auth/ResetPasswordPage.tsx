// src/features/auth/ResetPasswordPage.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, AlertCircle, Check, ArrowRight } from 'lucide-react';
import {
  nuevaPasswordSchema,
  type NuevaPasswordInput,
} from '@/core/domain/schemas/auth.schema';
import { useAuth } from './hooks/useAuth';

export function ResetPasswordPage() {
  const { actualizarPassword } = useAuth();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const form = useForm<NuevaPasswordInput>({
    resolver: zodResolver(nuevaPasswordSchema),
    defaultValues: { passwordNueva: '', confirmarPassword: '' },
  });

  const onSubmit = async (data: NuevaPasswordInput) => {
    setError(null);
    setCargando(true);
    try {
      await actualizarPassword(data.passwordNueva);
      setExito(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 bg-grid flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-accent-600" />
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent-700">
              Nueva contraseña
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-neutral-950 tracking-tight">
            Restablece tu contraseña
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Elige una contraseña nueva y segura para tu cuenta.
          </p>
        </div>

        {exito ? (
          <div className="border-l-2 border-accent-600 bg-accent-50 px-5 py-5 space-y-3">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-accent-700" />
              <p className="text-sm font-bold text-accent-900">
                Contraseña actualizada
              </p>
            </div>
            <p className="text-xs text-accent-900 leading-relaxed">
              Tu contraseña fue cambiada con éxito. Serás redirigido al inicio
              de sesión en unos segundos...
            </p>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-neutral-800 mb-2">
                <span>Nueva contraseña</span>
                {form.formState.errors.passwordNueva && (
                  <span className="text-rose-600 font-medium">
                    {form.formState.errors.passwordNueva.message}
                  </span>
                )}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  {...form.register('passwordNueva')}
                  className={`w-full bg-white border ${
                    form.formState.errors.passwordNueva
                      ? 'border-rose-400 focus:border-rose-600'
                      : 'border-neutral-400 focus:border-neutral-900'
                  } pl-10 pr-3.5 py-3 text-sm text-neutral-950 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all`}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between text-xs font-semibold text-neutral-800 mb-2">
                <span>Confirmar contraseña</span>
                {form.formState.errors.confirmarPassword && (
                  <span className="text-rose-600 font-medium">
                    {form.formState.errors.confirmarPassword.message}
                  </span>
                )}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  {...form.register('confirmarPassword')}
                  className={`w-full bg-white border ${
                    form.formState.errors.confirmarPassword
                      ? 'border-rose-400 focus:border-rose-600'
                      : 'border-neutral-400 focus:border-neutral-900'
                  } pl-10 pr-3.5 py-3 text-sm text-neutral-950 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all`}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 border-l-2 border-rose-500 bg-rose-50 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-900 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="group w-full flex items-center justify-between bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50 transition-colors"
            >
              <span>{cargando ? 'Actualizando...' : 'Cambiar contraseña'}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}