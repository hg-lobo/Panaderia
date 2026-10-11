// src/features/panel/components/UserMenu.tsx

import { useEffect, useRef, useState } from 'react';
import { Menu, User, LogOut, X, Circle } from 'lucide-react';
import type { Perfil } from '@/infrastructure/types/database.types';

interface UserMenuProps {
  readonly perfil: Perfil | null;
  readonly email: string;
  readonly onVerPerfil: () => void;
  readonly onCerrarSesion: () => void;
}

export function UserMenu({
  perfil, email, onVerPerfil, onCerrarSesion,
}: UserMenuProps) {
  const [abierto, setAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    if (!abierto) return;

    const onClickFuera = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };

    document.addEventListener('mousedown', onClickFuera);
    document.addEventListener('keydown', onEscape);

    return () => {
      document.removeEventListener('mousedown', onClickFuera);
      document.removeEventListener('keydown', onEscape);
    };
  }, [abierto]);

  const nombreMostrado = perfil?.nombre_completo ?? email.split('@')[0] ?? 'Usuario';

  return (
    <div ref={menuRef} className="relative">
      {/* Botón de hamburguesa + nombre */}
      <button
        onClick={() => setAbierto((a) => !a)}
        className={`flex items-center gap-3 border px-3 py-2 transition-colors ${
          abierto
            ? 'border-neutral-900 bg-neutral-950 text-white'
            : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900'
        }`}
        aria-label="Menú de usuario"
      >
        {abierto ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
        <span className="hidden sm:block text-sm font-semibold max-w-[160px] truncate">
          {nombreMostrado}
        </span>
        <span
          className={`h-2 w-2 rounded-full ${
            abierto ? 'bg-accent-400' : 'bg-accent-500'
          }`}
        />
      </button>

      {/* Dropdown */}
      {abierto && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-neutral-300 shadow-xl z-50">
          {/* Info del usuario arriba */}
          <div className="px-5 py-4 border-b border-neutral-200 bg-stone-50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 border border-neutral-300 bg-white flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-neutral-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-neutral-950 truncate">
                  {perfil?.nombre_completo ?? 'Usuario'}
                </p>
                <p className="text-[10px] font-mono text-neutral-500 truncate">
                  {email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-200">
              <Circle className="h-2 w-2 fill-accent-500 text-accent-500" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500">
                {perfil?.rol ?? 'ADMIN'}
              </span>
            </div>
          </div>

          {/* Opciones */}
          <div className="py-2">
            <button
              onClick={() => {
                setAbierto(false);
                onVerPerfil();
              }}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-neutral-800 hover:bg-neutral-50 transition-colors text-left"
            >
              <User className="h-4 w-4 text-neutral-500" />
              <span className="font-medium">Ver perfil</span>
            </button>

            <button
              onClick={() => {
                setAbierto(false);
                onCerrarSesion();
              }}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-rose-700 hover:bg-rose-50 transition-colors text-left border-t border-neutral-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}