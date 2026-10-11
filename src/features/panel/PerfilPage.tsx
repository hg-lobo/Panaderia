// src/features/panel/PerfilPage.tsx

import { useState } from 'react';
import {
  User, Mail, Shield, Calendar, Save, AlertCircle, Check,
  Lock, Eye, EyeOff,
} from 'lucide-react';
import { supabase } from '@/infrastructure/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function PerfilPage() {
  const { perfil, sesion, actualizarPassword } = useAuth();

  // Estado del formulario de perfil
  const [nombreCompleto, setNombreCompleto] = useState(
    perfil?.nombre_completo ?? '',
  );
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario de contraseña
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [exitoPassword, setExitoPassword] = useState(false);

  const email = sesion?.user.email ?? '—';
  const creadoEn = perfil?.created_at
    ? new Date(perfil.created_at).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const hayCambios = nombreCompleto.trim() !== (perfil?.nombre_completo ?? '');

  const guardarPerfil = async () => {
    if (!perfil || !hayCambios) return;
    if (nombreCompleto.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres');
      return;
    }

    setGuardando(true);
    setError(null);
    setExito(false);

    const { error: err } = await supabase
      .from('perfiles')
      .update({ nombre_completo: nombreCompleto.trim() })
      .eq('id', perfil.id);

    setGuardando(false);

    if (err) {
      setError(err.message);
      return;
    }

    setExito(true);
    setTimeout(() => setExito(false), 3000);
  };

  const guardarPassword = async () => {
    setErrorPassword(null);
    setExitoPassword(false);

    if (nuevaPassword.length < 8) {
      setErrorPassword('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(nuevaPassword)) {
      setErrorPassword('Debe contener al menos una letra mayúscula');
      return;
    }
    if (!/[0-9]/.test(nuevaPassword)) {
      setErrorPassword('Debe contener al menos un número');
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setErrorPassword('Las contraseñas no coinciden');
      return;
    }

    setGuardandoPassword(true);
    try {
      await actualizarPassword(nuevaPassword);
      setExitoPassword(true);
      setNuevaPassword('');
      setConfirmarPassword('');
      setTimeout(() => setExitoPassword(false), 4000);
    } catch (err) {
      setErrorPassword(
        err instanceof Error ? err.message : 'Error al cambiar contraseña',
      );
    } finally {
      setGuardandoPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 border-2 border-neutral-900 bg-neutral-50 flex items-center justify-center">
          <User className="h-6 w-6 text-neutral-700" />
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent-700 mb-1">
            Mi cuenta
          </p>
          <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
            {perfil?.nombre_completo ?? 'Usuario'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {perfil?.rol ?? 'ADMIN'} · {email}
          </p>
        </div>
      </div>

      {/* Info personal */}
      <div className="bg-white border border-neutral-300">
        <header className="border-b border-neutral-200 px-6 py-4">
          <h2 className="text-sm font-bold text-neutral-950 tracking-tight">
            Información personal
          </h2>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500 mt-1">
            Puedes editar tu nombre
          </p>
        </header>

        <div className="p-6 space-y-5">
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 mb-2">
              <User className="h-3.5 w-3.5 text-neutral-500" />
              Nombre completo
            </label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              className="w-full border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 mb-2">
              <Mail className="h-3.5 w-3.5 text-neutral-500" />
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full border border-neutral-200 bg-stone-50 px-3 py-2.5 text-sm text-neutral-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 mb-2">
                <Shield className="h-3.5 w-3.5 text-neutral-500" />
                Rol en el sistema
              </label>
              <input
                type="text"
                value={perfil?.rol ?? 'ADMIN'}
                readOnly
                className="w-full border border-neutral-200 bg-stone-50 px-3 py-2.5 text-sm text-neutral-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-800 mb-2">
                <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                Miembro desde
              </label>
              <input
                type="text"
                value={creadoEn}
                readOnly
                className="w-full border border-neutral-200 bg-stone-50 px-3 py-2.5 text-sm text-neutral-500 cursor-not-allowed"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 border-l-2 border-rose-500 bg-rose-50 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-900 font-medium">{error}</p>
            </div>
          )}

          {exito && (
            <div className="flex items-start gap-3 border-l-2 border-accent-600 bg-accent-50 px-4 py-3">
              <Check className="h-4 w-4 text-accent-700 shrink-0 mt-0.5" />
              <p className="text-xs text-accent-900 font-medium">
                Cambios guardados correctamente.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <button
              onClick={guardarPerfil}
              disabled={!hayCambios || guardando}
              className="flex items-center gap-2 bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white border border-neutral-300">
        <header className="border-b border-neutral-200 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-950 tracking-tight">
            <Lock className="h-4 w-4 text-neutral-700" />
            Cambiar contraseña
          </h2>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500 mt-1">
            Protege tu cuenta con una contraseña segura
          </p>
        </header>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-2">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número"
                className="w-full border border-neutral-400 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-neutral-900"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                {mostrarPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-2">
              Confirmar contraseña
            </label>
            <input
              type={mostrarPassword ? 'text' : 'password'}
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              placeholder="Repite la contraseña"
              className="w-full border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
              autoComplete="new-password"
            />
          </div>

          {errorPassword && (
            <div className="flex items-start gap-3 border-l-2 border-rose-500 bg-rose-50 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-900 font-medium">
                {errorPassword}
              </p>
            </div>
          )}

          {exitoPassword && (
            <div className="flex items-start gap-3 border-l-2 border-accent-600 bg-accent-50 px-4 py-3">
              <Check className="h-4 w-4 text-accent-700 shrink-0 mt-0.5" />
              <p className="text-xs text-accent-900 font-medium">
                Contraseña actualizada correctamente.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <button
              onClick={guardarPassword}
              disabled={
                guardandoPassword ||
                nuevaPassword === '' ||
                confirmarPassword === ''
              }
              className="flex items-center gap-2 bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Lock className="h-4 w-4" />
              {guardandoPassword ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}