// src/features/panel/ReglasPage.tsx

import { useState } from 'react';
import {
  Plus, Power, PowerOff, Pencil, ScrollText, Zap,
} from 'lucide-react';
import { useReglasActivas } from '@/infrastructure/supabase/queries/dashboard.queries';
import { useToggleRegla } from '@/infrastructure/supabase/queries/reglas.mutations';
import { ReglaForm } from './components/ReglaForm';
import { AsistenteRegla } from './components/asistente/AsistenteRegla';
import { describirRegla, categoriaMeta } from '@/core/inference/regla-legible';
import type { ReglaNegocio } from '@/infrastructure/types/database.types';

export function ReglasPage() {
  const { data: reglas = [], isLoading } = useReglasActivas();
  const toggle = useToggleRegla();

  const [formAbierto, setFormAbierto] = useState(false);
  const [reglaEditar, setReglaEditar] = useState<ReglaNegocio | null>(null);
  const [asistenteAbierto, setAsistenteAbierto] = useState(false);

  const abrirCrear = () => {
    setAsistenteAbierto(true);
  };

  const abrirEditar = (r: ReglaNegocio) => {
    setReglaEditar(r);
    setFormAbierto(true);
  };

  const activas = reglas.filter((r) => r.activa).length;
  const inactivas = reglas.length - activas;

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="border-l-2 border-accent-600 bg-accent-50/50 px-5 py-4">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-accent-800 mb-1">
          ¿Qué son las reglas?
        </p>
        <p className="text-xs text-accent-900 leading-relaxed max-w-3xl">
          Son las decisiones automáticas que el sistema toma por ti en el
          punto de venta: aplicar descuentos, avisar de vencimientos, alertar
          sobre stock bajo y bloquear ventas cuando algo no cuadra. Puedes
          activarlas o desactivarlas cuando quieras — los cambios se aplican
          al instante.
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 border border-neutral-300 flex items-center justify-center">
            <ScrollText className="h-4 w-4 text-neutral-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
              Reglas del sistema
            </h2>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-neutral-500">
              {reglas.length} {reglas.length === 1 ? 'regla' : 'reglas'}
              {reglas.length > 0 && (
                <>
                  {' · '}
                  <span className="text-accent-700">
                    {activas} activa{activas !== 1 ? 's' : ''}
                  </span>
                  {inactivas > 0 && (
                    <>
                      {' · '}
                      <span className="text-neutral-500">
                        {inactivas} inactiva{inactivas !== 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva regla
        </button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="bg-white border border-neutral-300 py-16 text-center">
          <div className="mx-auto h-6 w-6 border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
        </div>
      ) : reglas.length === 0 ? (
        <div className="bg-white border border-neutral-300 py-16 text-center">
          <ScrollText className="mx-auto h-8 w-8 text-neutral-300 mb-3" />
          <p className="text-sm font-semibold text-neutral-700">
            Sin reglas configuradas
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Crea tu primera regla para automatizar decisiones del sistema.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reglas.map((r) => {
            const cat = categoriaMeta(r.categoria);
            const descripcionLegible = describirRegla(r);

            return (
              <article
                key={r.id}
                className={`bg-white border transition-colors ${
                  r.activa
                    ? 'border-neutral-300'
                    : 'border-neutral-200 bg-neutral-50/30 opacity-75'
                }`}
              >
                <div className="p-6">
                  {/* Header con estado visible */}
                  <header className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Ícono + estado */}
                      <div className="relative shrink-0">
                        <div
                          className={`h-11 w-11 border flex items-center justify-center ${
                            r.activa
                              ? 'border-accent-300 bg-accent-50'
                              : 'border-neutral-300 bg-neutral-100'
                          }`}
                        >
                          <Zap
                            className={`h-4 w-4 ${
                              r.activa
                                ? 'text-accent-700'
                                : 'text-neutral-400'
                            }`}
                          />
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                            r.activa ? 'bg-accent-500' : 'bg-neutral-400'
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`text-[10px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 border ${cat.bg} ${cat.color}`}
                          >
                            {cat.label}
                          </span>
                          <span
                            className={`text-[10px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 border ${
                              r.activa
                                ? 'bg-accent-600 text-white border-accent-600'
                                : 'bg-neutral-200 text-neutral-600 border-neutral-300'
                            }`}
                          >
                            {r.activa ? 'Activa' : 'Inactiva'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-neutral-950 tracking-tight">
                          {r.nombre}
                        </h3>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => abrirEditar(r)}
                        className="h-9 w-9 border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
                        title="Editar regla"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          toggle.mutate({ id: r.id, activa: !r.activa })
                        }
                        className={`h-9 px-3 border flex items-center gap-2 text-xs font-bold tracking-wider uppercase transition-colors ${
                          r.activa
                            ? 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                            : 'border-accent-300 text-accent-700 hover:bg-accent-50'
                        }`}
                        title={r.activa ? 'Desactivar' : 'Activar'}
                      >
                        {r.activa ? (
                          <>
                            <PowerOff className="h-3 w-3" /> Desactivar
                          </>
                        ) : (
                          <>
                            <Power className="h-3 w-3" /> Activar
                          </>
                        )}
                      </button>
                    </div>
                  </header>

                  {/* Descripción humana */}
                  <div className="border-l-2 border-accent-600 bg-accent-50/40 px-4 py-3 mb-4">
                    <p className="text-sm text-neutral-800 leading-relaxed">
                      {descripcionLegible}
                    </p>
                  </div>

                  {r.descripcion && (
                    <p className="text-xs text-neutral-500 mb-4 italic">
                      {r.descripcion}
                    </p>
                  )}

                  {/* Detalles técnicos colapsables */}
                  <details className="border-t border-neutral-100 pt-4 group">
                    <summary className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 cursor-pointer hover:text-neutral-900 transition-colors select-none">
                      <span className="group-open:rotate-90 transition-transform">
                        ▶
                      </span>
                      Ver configuración técnica
                    </summary>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="md:col-span-1">
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">
                          Identificador
                        </p>
                        <p className="text-xs font-mono text-neutral-700 break-all">
                          {r.codigo}
                        </p>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2 mt-3">
                          Orden de evaluación
                        </p>
                        <p className="text-sm font-bold text-neutral-900 tabular-nums">
                          {r.prioridad}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">
                          Cuándo se activa
                        </p>
                        <pre className="text-[10px] font-mono text-neutral-700 bg-stone-50 border border-neutral-200 p-3 overflow-x-auto">
                          {JSON.stringify(r.condicion, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-2">
                          Qué hace
                        </p>
                        <pre className="text-[10px] font-mono text-neutral-700 bg-stone-50 border border-neutral-200 p-3 overflow-x-auto">
                          {JSON.stringify(r.accion, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </details>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal para editar reglas existentes (formulario técnico) */}
      <ReglaForm
        key={reglaEditar?.id ?? 'nueva'}
        abierto={formAbierto}
        onCerrar={() => setFormAbierto(false)}
        regla={reglaEditar}
      />

      {/* Asistente guiado para crear reglas nuevas */}
      <AsistenteRegla
        abierto={asistenteAbierto}
        onCerrar={() => setAsistenteAbierto(false)}
      />
    </div>
  );
}