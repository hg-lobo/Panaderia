// src/features/auth/hooks/useAuth.ts

import { useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/infrastructure/supabase/client';
import type { Perfil } from '@/infrastructure/types/database.types';

interface AuthState {
  readonly sesion: Session | null;
  readonly usuario: User | null;
  readonly perfil: Perfil | null;
  readonly cargando: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    sesion: null,
    usuario: null,
    perfil: null,
    cargando: true,
  });

  const cargarPerfil = useCallback(async (userId: string): Promise<Perfil | null> => {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error cargando perfil:', error.message);
      return null;
    }
    return data as Perfil | null;
  }, []);

  useEffect(() => {
    let montado = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!montado) return;

      if (session?.user) {
        const perfil = await cargarPerfil(session.user.id);
        if (!montado) return;
        setState({
          sesion: session,
          usuario: session.user,
          perfil,
          cargando: false,
        });
      } else {
        setState({ sesion: null, usuario: null, perfil: null, cargando: false });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!montado) return;

      if (session?.user) {
        const perfil = await cargarPerfil(session.user.id);
        if (!montado) return;
        setState({
          sesion: session,
          usuario: session.user,
          perfil,
          cargando: false,
        });
      } else {
        setState({ sesion: null, usuario: null, perfil: null, cargando: false });
      }
    });

    return () => {
      montado = false;
      subscription.unsubscribe();
    };
  }, [cargarPerfil]);

  /* ============================================================
     REGISTRO
     ============================================================ */
  const registrar = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    return data;
  }, []);

  /* ============================================================
     LOGIN
     ============================================================ */
  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return data;
  }, []);

  /* ============================================================
     LOGIN CON GOOGLE
     ============================================================ */
  const iniciarConGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw new Error(error.message);
  }, []);

  /* ============================================================
     CERRAR SESIÓN
     ============================================================ */
  const cerrarSesion = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }, []);

  /* ============================================================
     RECUPERAR CONTRASEÑA
     Envía un email con un enlace para restablecer la contraseña.
     El enlace apunta a /reset-password en nuestra app.
     ============================================================ */
  const recuperarPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  }, []);

  /* ============================================================
     ACTUALIZAR CONTRASEÑA
     Se usa tanto en el perfil (usuario logueado) como en el
     flujo de recuperación (después de hacer clic en el email).
     ============================================================ */
  const actualizarPassword = useCallback(
    async (nuevaPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: nuevaPassword,
      });
      if (error) throw new Error(error.message);
    },
    [],
  );

  return {
    ...state,
    registrar,
    iniciarSesion,
    iniciarConGoogle,
    cerrarSesion,
    recuperarPassword,
    actualizarPassword,
  };
}