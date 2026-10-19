// src/features/panel/PanelLayout.tsx

import { useState, useEffect, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar, type RutaPanel } from './components/Sidebar';
import { UserMenu } from './components/UserMenu';
import type { Perfil } from '@/infrastructure/types/database.types';

interface PanelLayoutProps {
  readonly children: ReactNode;
  readonly rutaActiva: RutaPanel;
  readonly onNavegar: (ruta: RutaPanel) => void;
  readonly perfil: Perfil | null;
  readonly email: string;
  readonly onCerrarSesion: () => void;
  readonly onVerPerfil: () => void;
  readonly titulo: string;
  readonly subtitulo: string;
}

const STORAGE_KEY = 'don-christopher:sidebar-colapsado';

export function PanelLayout({
  children, rutaActiva, onNavegar, perfil, email, onCerrarSesion,
  onVerPerfil, titulo, subtitulo,
}: PanelLayoutProps) {
  // Estado: colapsado en desktop (persistido en localStorage)
  const [colapsado, setColapsado] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Estado: drawer en móvil
  const [movilAbierto, setMovilAbierto] = useState(false);

  // Persistir el estado colapsado
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(colapsado));
    } catch {
      /* localStorage no disponible — ignorar */
    }
  }, [colapsado]);

  // El mismo botón ☰ hace 2 cosas según dispositivo
  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMovilAbierto((v) => !v);
    } else {
      setColapsado((c) => !c);
    }
  };

  const navegar = (ruta: RutaPanel) => {
    onNavegar(ruta);
    setMovilAbierto(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-stone-100 bg-grid flex relative">
      {/* ============================================================
          SIDEBAR DESKTOP (≥ lg)
          ============================================================ */}
      <div className="hidden lg:block relative">
        <Sidebar
          rutaActiva={rutaActiva}
          onNavegar={navegar}
          colapsado={colapsado}
          onToggleColapso={() => setColapsado((c) => !c)}
        />
      </div>

      {/* ============================================================
          SIDEBAR MÓVIL (< lg)
          ============================================================ */}
      {/* Overlay */}
      <div
        onClick={() => setMovilAbierto(false)}
        className={`lg:hidden fixed inset-0 z-40 bg-neutral-950/60 backdrop-blur-sm transition-opacity duration-300 ${
          movilAbierto
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer móvil */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-out ${
          movilAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          rutaActiva={rutaActiva}
          onNavegar={navegar}
          colapsado={false}
          onToggleColapso={() => setMovilAbierto(false)}
          esMovil={true}
          onCerrarMovil={() => setMovilAbierto(false)}
        />
      </div>

      {/* ============================================================
          CONTENIDO PRINCIPAL
          ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-16 shrink-0 border-b border-neutral-300 bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 sm:px-8 relative z-30">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Botón ☰ unificado: desktop colapsa, móvil abre drawer */}
            <button
              onClick={toggleSidebar}
              className="h-9 w-9 -ml-1 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 transition-colors rounded"
              aria-label="Alternar menú lateral"
            >
              {movilAbierto ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <div className="min-w-0">
              <h1 className="text-base font-bold text-neutral-950 tracking-tight truncate">
                {titulo}
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500 truncate">
                {subtitulo}
              </p>
            </div>
          </div>

          <UserMenu
            perfil={perfil}
            email={email}
            onVerPerfil={onVerPerfil}
            onCerrarSesion={onCerrarSesion}
          />
        </header>

        <main className="flex-1 overflow-y-auto relative z-0">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}