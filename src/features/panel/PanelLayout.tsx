// src/features/panel/PanelLayout.tsx

import { useState, type ReactNode } from 'react';
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

export function PanelLayout({
  children, rutaActiva, onNavegar, perfil, email, onCerrarSesion,
  onVerPerfil, titulo, subtitulo,
}: PanelLayoutProps) {
  const [colapsado, setColapsado] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-stone-100 bg-grid flex">
      <Sidebar
        rutaActiva={rutaActiva}
        onNavegar={onNavegar}
        colapsado={colapsado}
        onToggleColapso={() => setColapsado((c) => !c)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Topbar — z-40 para estar por encima del contenido */}
        <header className="h-16 shrink-0 border-b border-neutral-300 bg-white/80 backdrop-blur-sm flex items-center justify-between px-8 relative z-40">
          <div className="min-w-0">
            <h1 className="text-base font-bold text-neutral-950 tracking-tight truncate">
              {titulo}
            </h1>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500 truncate">
              {subtitulo}
            </p>
          </div>

          <UserMenu
            perfil={perfil}
            email={email}
            onVerPerfil={onVerPerfil}
            onCerrarSesion={onCerrarSesion}
          />
        </header>

        {/* Contenido scrolleable — z-0 para quedar debajo del header */}
        <main className="flex-1 overflow-y-auto relative z-0">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}