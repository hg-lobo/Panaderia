// src/features/panel/components/ReglaForm.tsx

import { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import {
  useCrearRegla, useActualizarRegla,
} from '@/infrastructure/supabase/queries/reglas.mutations';
import type { ReglaNegocio } from '@/infrastructure/types/database.types';

interface ReglaFormProps {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
  readonly regla: ReglaNegocio | null;
}

const CATEGORIAS = [
  { valor: 'COMBO', label: 'Combos y promociones' },
  { valor: 'VENCIMIENTO', label: 'Productos por vencer' },
  { valor: 'STOCK', label: 'Control de inventario' },
  { valor: 'PRECIO', label: 'Reglas de precio' },
  { valor: 'POLITICA', label: 'Reglas generales' },
] as const;

type CategoriaValor = typeof CATEGORIAS[number]['valor'];

export function ReglaForm({ abierto, onCerrar, regla }: ReglaFormProps) {
  const crear = useCrearRegla();
  const actualizar = useActualizarRegla();
  const esEdicion = regla !== null;

  const [codigo, setCodigo] = useState(regla?.codigo ?? '');
  const [nombre, setNombre] = useState(regla?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(regla?.descripcion ?? '');
  const [categoria, setCategoria] = useState<CategoriaValor>(
    regla?.categoria ?? 'POLITICA',
  );
  const [prioridad, setPrioridad] = useState(regla?.prioridad ?? 50);
  const [activa, setActiva] = useState(regla?.activa ?? true);
  const [condicionJson, setCondicionJson] = useState(
    regla
      ? JSON.stringify(regla.condicion, null, 2)
      : '{\n  "tipo": "producto",\n  "campo": "stock",\n  "operador": "<=",\n  "valor": 5\n}',
  );
  const [accionJson, setAccionJson] = useState(
    regla
      ? JSON.stringify(regla.accion, null, 2)
      : '{\n  "tipo": "alerta",\n  "nivel": "AMARILLO",\n  "mensaje": "Stock bajo"\n}',
  );
  const [error, setError] = useState<string | null>(null);

  const handleGuardar = async () => {
    setError(null);
    if (codigo.trim() === '' || nombre.trim() === '') {
      setError('El nombre y el identificador son obligatorios');
      return;
    }

    let condicion: Record<string, unknown>;
    let accion: Record<string, unknown>;
    try {
      condicion = JSON.parse(condicionJson);
      accion = JSON.parse(accionJson);
    } catch {
      setError('La configuración de la regla no tiene el formato correcto');
      return;
    }

    const payload = {
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      categoria,
      condicion,
      accion,
      prioridad,
      activa,
    };

    try {
      if (esEdicion && regla) {
        await actualizar.mutateAsync({ id: regla.id, cambios: payload });
      } else {
        await crear.mutateAsync(payload);
      }
      onCerrar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la regla');
    }
  };

  const guardando = crear.isPending || actualizar.isPending;

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={esEdicion ? 'Editar regla' : 'Nueva regla'}
      subtitulo={esEdicion ? 'Modificar comportamiento del sistema' : 'Automatizar una decisión'}
      ancho="xl"
    >
      <div className="space-y-6">
        {/* Sección: Información básica */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-4">
            Información básica
          </p>
          <div className="space-y-5">
            <Campo
              label="Nombre de la regla"
              placeholder="Ej. Avisar cuando queda poco stock"
              value={nombre}
              onChange={setNombre}
            />
            <Campo
              label="Identificador interno"
              placeholder="Ej. STOCK_BAJO_DEFAULT"
              value={codigo}
              onChange={setCodigo}
              ayuda="Un nombre corto y único en mayúsculas. Solo se usa internamente."
            />
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Explica en pocas palabras qué hace esta regla"
                className="w-full bg-white border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sección: Configuración */}
        <div className="border-t border-neutral-200 pt-6">
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 mb-4">
            Configuración
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-2">
                Tipo de regla
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaValor)}
                className="w-full bg-white border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-2">
                Orden de evaluación
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                value={prioridad}
                onChange={(e) => setPrioridad(Number(e.target.value))}
                className="w-full bg-white border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
              />
              <p className="mt-1 text-[10px] text-neutral-500">
                Mayor número = se revisa primero.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-2">
                Estado
              </label>
              <button
                type="button"
                onClick={() => setActiva((a) => !a)}
                className={`w-full px-3 py-2.5 text-sm font-semibold border transition-colors ${
                  activa
                    ? 'bg-accent-50 text-accent-800 border-accent-300'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-300'
                }`}
              >
                {activa ? 'Activa' : 'Inactiva'}
              </button>
              <p className="mt-1 text-[10px] text-neutral-500">
                Las reglas inactivas no se ejecutan.
              </p>
            </div>
          </div>
        </div>

        {/* Sección: Comportamiento (JSON técnico) */}
        <details className="border-t border-neutral-200 pt-6">
          <summary className="text-[10px] font-bold tracking-[0.25em] uppercase text-neutral-500 cursor-pointer hover:text-neutral-900 transition-colors select-none mb-4">
            Comportamiento detallado (avanzado)
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-2">
                Cuándo se activa
              </label>
              <textarea
                rows={10}
                value={condicionJson}
                onChange={(e) => setCondicionJson(e.target.value)}
                className="w-full bg-stone-50 border border-neutral-400 px-3 py-2.5 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-2">
                Qué hace
              </label>
              <textarea
                rows={10}
                value={accionJson}
                onChange={(e) => setAccionJson(e.target.value)}
                className="w-full bg-stone-50 border border-neutral-400 px-3 py-2.5 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-900 resize-none"
              />
            </div>
          </div>
        </details>

        {error && (
          <div className="flex items-start gap-3 border-l-2 border-rose-500 bg-rose-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-900 font-medium">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-950"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="flex items-center gap-2 bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear regla'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Campo({
  label, value, onChange, placeholder, ayuda,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ayuda?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-800 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-neutral-400 px-3 py-2.5 text-sm focus:outline-none focus:border-neutral-900"
      />
      {ayuda && (
        <p className="mt-1 text-[10px] text-neutral-500">{ayuda}</p>
      )}
    </div>
  );
}