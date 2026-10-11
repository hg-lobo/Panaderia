// src/shared/ui/ErrorBoundary.tsx

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly onReset?: () => void;
}

interface ErrorBoundaryState {
  readonly tieneError: boolean;
  readonly error: Error | null;
  readonly info: ErrorInfo | null;
}

/**
 * Error Boundary global.
 * Captura errores de renderizado en cualquier parte del árbol de React
 * y muestra una UI amigable en lugar de una pantalla en blanco.
 *
 * HOW: React llama a `componentDidCatch` cuando un componente hijo lanza
 *      una excepción durante el render.
 * WHY: Sin esto, un error en cualquier componente rompe toda la app.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { tieneError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { tieneError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // En producción aquí enviarías el error a Sentry / LogRocket
    console.error('ErrorBoundary capturó un error:', error, info);
    this.setState({ info });
  }

  private reset = (): void => {
    this.setState({ tieneError: false, error: null, info: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (!this.state.tieneError) return this.props.children;

    const { error } = this.state;

    return (
      <div className="min-h-screen bg-stone-100 bg-grid flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Cabecera con ícono */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 border-2 border-rose-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-rose-700 mb-1">
                Error crítico
              </p>
              <h1 className="text-2xl font-bold text-neutral-950 tracking-tight">
                Algo salió mal.
              </h1>
            </div>
          </div>

          <p className="text-sm text-neutral-600 leading-relaxed mb-6">
            El sistema encontró un error inesperado al renderizar esta vista.
            Puedes intentar recuperarte o recargar la aplicación.
          </p>

          {/* Detalle del error */}
          {error && (
            <div className="bg-white border border-neutral-300 mb-6">
              <div className="border-b border-neutral-200 px-5 py-3">
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500">
                  Detalle técnico
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm font-mono text-rose-700 font-semibold break-all mb-2">
                  {error.name}: {error.message}
                </p>
                {error.stack && (
                  <details className="mt-3">
                    <summary className="text-xs font-semibold text-neutral-600 cursor-pointer hover:text-neutral-900">
                      Ver stack trace
                    </summary>
                    <pre className="mt-2 text-[10px] font-mono text-neutral-500 bg-stone-50 border border-neutral-200 p-3 overflow-x-auto max-h-60">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={this.reset}
              className="flex items-center gap-2 bg-neutral-950 px-5 py-3 text-sm font-semibold text-white hover:bg-accent-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar de nuevo
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-950 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar página
            </button>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="flex items-center gap-2 border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-950 transition-colors"
            >
              <Home className="h-4 w-4" />
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }
}