// src/features/panel/components/Sidebar.tsx

import {
  LayoutDashboard, Package, Gift, ShoppingCart,
  RotateCcw, ScrollText, ChevronLeft, BarChart3,
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
  rutaActiva: RutaPanel;
  onNavegar: (ruta: RutaPanel) => void;
  colapsado: boolean;
  onToggleColapso: () => void;
}

interface ItemNav {
  id: RutaPanel;
  label: string;
  icono: React.ReactNode;
  descripcion: string;
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
}: SidebarProps) {
  return (
    <aside
      className={`${
        colapsado ? 'w-18' : 'w-64'
      } h-screen shrink-0 border-r border-neutral-800 bg-neutral-950 transition-all duration-200 flex flex-col`}
    >
      {/* ============================================================
          Marca — logo + nombre de la panadería
          ============================================================ */}
      <div className="h-20 px-5 flex items-center gap-3 border-b border-neutral-800">
        {/* Ícono de la panadería */}
        <div className="h-10 w-10 shrink-0 ">
          <img
            src="/logo-don-christopher.png"
            alt="El Horno de Don Christopher"
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback si la imagen aún no existe
              e.currentTarget.style.display = 'none';
              const padre = e.currentTarget.parentElement;
              if (padre) {
                padre.innerHTML =
                  '<span style="font-size: 18px; line-height: 1;">🥖</span>';
              }
            }}
          />
        </div>

        {!colapsado && (
          <div className="overflow-hidden">
            <p className="font-display text-xs font-bold text-white tracking-tight whitespace-nowrap leading-tight">
              El Horno de
            </p>
            <p className="font-display text-xs font-bold text-amber-400 tracking-tight whitespace-nowrap leading-tight">
              Don Christopher
            </p>
          </div>
        )}
      </div>

      {/* ============================================================
          Navegación
          ============================================================ */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {ITEMS.map((item) => {
          const activo = rutaActiva === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavegar(item.id)}
              title={colapsado ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors group ${
                activo
                  ? 'bg-amber-700/15 border-l-2 border-amber-500 text-white'
                  : 'border-l-2 border-transparent text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100'
              }`}
            >
              <span className={`shrink-0 ${activo ? 'text-amber-400' : ''}`}>
                {item.icono}
              </span>
              {!colapsado && (
                <div className="overflow-hidden">
                  <p className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </p>
                  <p className="text-[10px] tracking-wider uppercase text-neutral-500 whitespace-nowrap">
                    {item.descripcion}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* ============================================================
          Botón colapsar
          ============================================================ */}
      <div className="border-t border-neutral-800 p-3">
        <button
          onClick={onToggleColapso}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-neutral-500 hover:text-neutral-200 transition-colors"
          title={colapsado ? 'Expandir' : 'Colapsar'}
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform ${
              colapsado ? 'rotate-180' : ''
            }`}
          />
          {!colapsado && <span>Colapsar</span>}
        </button>
      </div>
    </aside>
  );
}