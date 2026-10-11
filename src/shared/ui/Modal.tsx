// src/shared/ui/Modal.tsx

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface ModalProps {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly titulo: string;
  readonly subtitulo?: string;
  readonly children: ReactNode;
  readonly ancho?: 'md' | 'lg' | 'xl';
}

const anchoClase = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  abierto, onCerrar, titulo, subtitulo, children, ancho = 'lg',
}: ModalProps) {
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
        onClick={onCerrar}
      />
      <div
        className={`relative w-full ${anchoClase[ancho]} bg-white border border-neutral-300 max-h-[90vh] flex flex-col`}
      >
        <header className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
              {titulo}
            </h2>
            {subtitulo && (
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500 mt-1">
                {subtitulo}
              </p>
            )}
          </div>
          <button
            onClick={onCerrar}
            className="h-8 w-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}