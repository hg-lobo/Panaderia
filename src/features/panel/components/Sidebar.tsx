// src/features/panel/components/Sidebar.tsx

import {
  LayoutDashboard, Package, Gift, ShoppingCart,
  RotateCcw, ScrollText, BarChart3, ChevronLeft, ChevronRight, X,
} from 'lucide-react';

export type RutaPanel =
  | 'dashboard'
  | 'pos'
  | 'productos'
  | 'combos'
  | 'devoluciones'
  | 'reportes'
  | 'reglas';

interface SidebarProps {
  readonly rutaActiva: RutaPanel;
  readonly onNavegar: (ruta: RutaPanel) => void;
  readonly colapsado: boolean;
  readonly onToggleColapso: () => void;
  readonly esMovil?: boolean;
  readonly onCerrarMovil?: () => void;
}

interface ItemNav {
  readonly id: RutaPanel;
  readonly label: string;
  readonly icono: React.ReactNode;
  readonly descripcion: string;
}

const ITEMS: ItemNav[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    descripcion: 'Métricas y control',
    icono: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    id: 'pos',
    label: 'Punto de venta',
    descripcion: 'Registrar venta',
    icono: <ShoppingCart className="h-4 w-4" />,
  },
  {
    id: 'productos',
    label: 'Productos',
    descripcion: 'Inventario',
    icono: <Package className="h-4 w-4" />,
  },
  {
    id: 'combos',
    label: 'Combos',
    descripcion: 'Ofertas activas',
    icono: <Gift className="h-4 w-4" />,
  },
  {
    id: 'devoluciones',
    label: 'Devoluciones',
    descripcion: 'Control de riesgos',
    icono: <RotateCcw className="h-4 w-4" />,
  },
  {
    id: 'reportes',
    label: 'Reportes',
    descripcion: 'Análisis avanzado',
    icono: <BarChart3 className="h-4 w-4" />,
  },
  {
    id: 'reglas',
    label: 'Reglas',
    descripcion: 'Automatizaciones',
    icono: <ScrollText className="h-4 w-4" />,
  },
];

export function Sidebar({
  rutaActiva, onNavegar, colapsado, onToggleColapso,
  esMovil = false, onCerrarMovil,
}: SidebarProps) {
  return (
    <aside
      className={`relative h-screen shrink-0 border-r border-neutral-800 bg-neutral-950 flex flex-col transition-[width] duration-300 ease-in-out ${
        colapsado && !esMovil ? 'w-18' : 'w-64'
      }`}
    >
      {/* ============================================================
          Header de la marca
          ============================================================ */}
      <div
        className={`h-20 border-b border-neutral-800 flex items-center transition-all duration-300 ${
          colapsado && !esMovil ? 'px-0 justify-center' : 'px-5 gap-3'
        }`}
      >
        {/* Logo */}
        <div className="h-10 w-10 shrink-0 border border-amber-600/40 bg-neutral-900 flex items-center justify-center overflow-hidden">
          <img
            src="/logo-don-christopher.png"
            alt="El Horno de Don Christopher"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const padre = e.currentTarget.parentElement;
              if (padre) {
                padre.innerHTML =
                  '<span style="font-size: 18px; line-height: 1;">🥖</span>';
              }
            }}
          />
        </div>

        {/* Texto de la marca — fade-out cuando colapsa */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out flex-1 ${
            colapsado && !esMovil
              ? 'max-w-0 opacity-0'
              : 'max-w-50 opacity-100'
          }`}
        >
          <p className="font-display text-xs font-bold text-white tracking-tight whitespace-nowrap leading-tight">
            El Horno de
          </p>
          <p className="font-display text-xs font-bold text-amber-400 tracking-tight whitespace-nowrap leading-tight">
            Don Christopher
          </p>
        </div>

        {/* Botón X solo en móvil */}
        {esMovil && (
          <button
            onClick={onCerrarMovil}
            className="h-8 w-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors -mr-2 ml-auto"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ============================================================
          Navegación
          ============================================================ */}
      <nav
        className={`flex-1 space-y-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
          colapsado && !esMovil ? 'px-2 py-3' : 'p-3'
        }`}
      >
        {ITEMS.map((item) => {
          const activo = rutaActiva === item.id;
          const colapsadoReal = colapsado && !esMovil;

          return (
            <button
              key={item.id}
              onClick={() => onNavegar(item.id)}
              title={colapsadoReal ? item.label : undefined}
              className={`w-full flex items-center transition-colors group relative ${
                colapsadoReal
                  ? 'justify-center px-0 py-3'
                  : 'gap-3 px-3 py-2.5'
              } ${
                activo
                  ? 'bg-amber-700/15 border-l-2 border-amber-500 text-white'
                  : 'border-l-2 border-transparent text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100'
              }`}
            >
              <span
                className={`shrink-0 ${activo ? 'text-amber-400' : ''}`}
              >
                {item.icono}
              </span>

              {/* Texto con fade-out */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  colapsadoReal
                    ? 'max-w-0 opacity-0 ml-0'
                    : 'max-w-45 opacity-100 ml-0'
                }`}
              >
                <p className="text-sm font-medium whitespace-nowrap text-left">
                  {item.label}
                </p>
                <p className="text-[10px] tracking-wider uppercase text-neutral-500 whitespace-nowrap text-left">
                  {item.descripcion}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* ============================================================
          Botón de colapsar — SOLO en desktop
          Vive en el borde derecho del sidebar
          ============================================================ */}
      {!esMovil && (
        <button
          onClick={onToggleColapso}
          className="absolute top-1/2 -right-3 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-amber-700 hover:border-amber-600 transition-all shadow-lg"
          title={colapsado ? 'Expandir sidebar' : 'Colapsar sidebar'}
          aria-label={colapsado ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {colapsado ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </aside>
  );
}