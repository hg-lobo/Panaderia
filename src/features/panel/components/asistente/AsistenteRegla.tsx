// src/features/panel/components/asistente/AsistenteRegla.tsx

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { useProductos } from '@/infrastructure/supabase/queries/dashboard.queries';
import { useCrearRegla } from '@/infrastructure/supabase/queries/reglas.mutations';
import { PasoAccion, type TipoAccion } from './PasoAccion';
import { PasoCombo, type ConfigCombo } from './PasoCombo';
import { PasoAlerta, type ConfigAlerta } from './PasoAlerta';
import { PasoRevision } from './PasoRevision';

interface AsistenteReglaProps {
  readonly abierto: boolean;
  readonly onCerrar: () => void;
}

const PASOS = ['Acción', 'Configuración', 'Revisión'] as const;
type Paso = (typeof PASOS)[number];

export function AsistenteRegla({ abierto, onCerrar }: AsistenteReglaProps) {
  const { data: productos = [] } = useProductos();
  const crear = useCrearRegla();

  const [paso, setPaso] = useState<Paso>('Acción');
  const [tipoAccion, setTipoAccion] = useState<TipoAccion | null>(null);
  const [nombre, setNombre] = useState('');
  const [prioridad, setPrioridad] = useState(100);
  const [configCombo, setConfigCombo] = useState<ConfigCombo>({
    nombre: '',
    items: [],
    tipoDescuento: 'PRECIO_FIJO',
    valor: 0,
  });
  const [configAlerta, setConfigAlerta] = useState<ConfigAlerta>({
    nivel: 'AMARILLO',
    mensaje: '',
    umbralDias: 7,
    umbralStock: 5,
  });
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPaso('Acción');
    setTipoAccion(null);
    setNombre('');
    setPrioridad(100);
    setConfigCombo({
      nombre: '',
      items: [],
      tipoDescuento: 'PRECIO_FIJO',
      valor: 0,
    });
    setConfigAlerta({
      nivel: 'AMARILLO',
      mensaje: '',
      umbralDias: 7,
      umbralStock: 5,
    });
    setError(null);
  };

  const cerrar = () => {
    reset();
    onCerrar();
  };

  // Validar el paso actual antes de avanzar
  const validarPaso = (): string | null => {
    if (paso === 'Acción') {
      if (!tipoAccion) return 'Selecciona una acción';
      return null;
    }

    if (paso === 'Configuración') {
      if (tipoAccion === 'descuento_combo') {
        if (!configCombo.nombre.trim()) return 'Ponle un nombre al combo';
        if (configCombo.items.length < 2)
          return 'Un combo debe tener al menos 2 productos';
        if (configCombo.valor <= 0) return 'Define el precio o descuento';

        // Validar que el descuento sea real
        const precioIndividual = configCombo.items.reduce((acc, it) => {
          const p = productos.find((x) => x.id === it.productoId);
          return acc + (p ? Number(p.precio_venta) * it.cantidad : 0);
        }, 0);

        if (
          configCombo.tipoDescuento === 'PRECIO_FIJO' &&
          configCombo.valor >= precioIndividual
        ) {
          return 'El precio del combo debe ser menor al precio normal';
        }
        if (
          configCombo.tipoDescuento === 'PORCENTAJE' &&
          configCombo.valor >= 100
        ) {
          return 'El porcentaje debe ser menor a 100';
        }
      }

      if (
        tipoAccion === 'alerta_vencimiento' ||
        tipoAccion === 'alerta_stock'
      ) {
        if (!configAlerta.mensaje.trim())
          return 'Escribe el mensaje que verá el cajero';
      }

      return null;
    }

    return null;
  };

  const siguiente = () => {
    const err = validarPaso();
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    if (paso === 'Acción') setPaso('Configuración');
    else if (paso === 'Configuración') setPaso('Revisión');
  };

  const anterior = () => {
    setError(null);
    if (paso === 'Configuración') setPaso('Acción');
    else if (paso === 'Revisión') setPaso('Configuración');
  };

  const guardar = async () => {
    if (!tipoAccion) return;
    setError(null);

    // Generar nombre automático si no se especificó
    const nombreFinal =
      nombre.trim() ||
      (tipoAccion === 'descuento_combo'
        ? configCombo.nombre
        : tipoAccion === 'alerta_vencimiento'
          ? `Alerta vencimiento ${configAlerta.umbralDias}d`
          : tipoAccion === 'alerta_stock'
            ? `Alerta stock ${configAlerta.umbralStock}u`
            : 'Regla de bloqueo');

    // Generar JSON de condición y acción según tipo
    let condicion: Record<string, unknown>;
    let accion: Record<string, unknown>;
    let categoria: 'COMBO' | 'VENCIMIENTO' | 'STOCK' | 'POLITICA';
    let codigoBase: string;

    if (tipoAccion === 'descuento_combo') {
      categoria = 'COMBO';
      codigoBase = `COMBO_${nombreFinal.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
      condicion = {
        tipo: 'carrito_contiene',
        comboId: 'auto',
        itemsCompletos: true,
      };
      accion = {
        tipo: 'aplicar_descuento',
        fuente: 'combo',
        campo: 'valor_descuento',
      };
    } else if (tipoAccion === 'alerta_vencimiento') {
      categoria = 'VENCIMIENTO';
      codigoBase = `VENC_${configAlerta.umbralDias ?? 7}D`;
      condicion = {
        tipo: 'producto',
        campo: 'fecha_vencimiento',
        operador: '<=',
        valor: `hoy+${configAlerta.umbralDias ?? 7}d`,
      };
      accion = {
        tipo: 'alerta',
        nivel: configAlerta.nivel,
        mensaje: configAlerta.mensaje,
      };
    } else if (tipoAccion === 'alerta_stock') {
      categoria = 'STOCK';
      codigoBase = `STOCK_${configAlerta.umbralStock ?? 5}U`;
      condicion = {
        tipo: 'producto',
        campo: 'stock',
        operador: '<=',
        valor: configAlerta.umbralStock ?? 5,
      };
      accion = {
        tipo: 'alerta',
        nivel: configAlerta.nivel,
        mensaje: configAlerta.mensaje,
      };
    } else {
      categoria = 'POLITICA';
      codigoBase = 'BLOQUEO_SIN_STOCK';
      condicion = {
        tipo: 'producto',
        campo: 'stock',
        operador: '=',
        valor: 0,
      };
      accion = {
        tipo: 'bloquear_venta',
        motivo: 'Producto sin stock disponible',
      };
    }

    try {
      await crear.mutateAsync({
        codigo: codigoBase,
        nombre: nombreFinal,
        descripcion: null,
        categoria,
        condicion,
        accion,
        prioridad,
        activa: true,
      });

      // Si es un combo, además crear el registro en la tabla combos
      if (tipoAccion === 'descuento_combo' && configCombo.items.length >= 2) {
        const { supabase } = await import('@/infrastructure/supabase/client');

        const { data: comboData, error: comboError } = await supabase
          .from('combos')
          .insert({
            nombre: configCombo.nombre,
            descripcion: null,
            tipo_descuento: configCombo.tipoDescuento,
            valor_descuento: configCombo.valor,
            estado: 'ACTIVO',
          })
          .select()
          .single();

        if (comboError) throw new Error(comboError.message);

        // Insertar los items del combo
        const items = configCombo.items.map((it) => ({
          combo_id: comboData.id,
          producto_id: it.productoId,
          cantidad: it.cantidad,
        }));

        const { error: itemsError } = await supabase
          .from('combo_items')
          .insert(items);

        if (itemsError) throw new Error(itemsError.message);
      }

      cerrar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  if (!abierto) return null;

  const indicePaso = PASOS.indexOf(paso);
  const esUltimo = indicePaso === PASOS.length - 1;
  const esPrimero = indicePaso === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
        onClick={cerrar}
      />
      <div className="relative w-full max-w-3xl bg-white border border-neutral-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <header className="border-b border-neutral-200 px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent-700 mb-1">
              Asistente de reglas
            </p>
            <h2 className="text-lg font-bold text-neutral-950 tracking-tight">
              {paso === 'Acción' && '¿Qué quieres automatizar?'}
              {paso === 'Configuración' && 'Configura los detalles'}
              {paso === 'Revisión' && 'Confirma tu regla'}
            </h2>
          </div>
          <button
            onClick={cerrar}
            className="h-8 w-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Indicador de pasos */}
        <div className="px-6 py-4 bg-stone-50 border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-2">
            {PASOS.map((p, i) => {
              const activo = p === paso;
              const completado = i < indicePaso;
              return (
                <div key={p} className="flex items-center gap-2 flex-1">
                  <div
                    className={`h-6 w-6 flex items-center justify-center text-[10px] font-bold border ${
                      completado
                        ? 'bg-accent-600 border-accent-600 text-white'
                        : activo
                          ? 'bg-neutral-950 border-neutral-950 text-white'
                          : 'bg-white border-neutral-300 text-neutral-400'
                    }`}
                  >
                    {completado ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase ${
                      activo
                        ? 'text-neutral-950'
                        : completado
                          ? 'text-accent-700'
                          : 'text-neutral-400'
                    }`}
                  >
                    {p}
                  </span>
                  {i < PASOS.length - 1 && (
                    <div className="flex-1 border-t border-neutral-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-6">
          {paso === 'Acción' && (
            <PasoAccion
              seleccionado={tipoAccion}
              onSeleccionar={(t) => {
                setTipoAccion(t);
                setError(null);
              }}
            />
          )}

          {paso === 'Configuración' && tipoAccion === 'descuento_combo' && (
            <PasoCombo
              productos={productos}
              config={configCombo}
              onCambiar={(c) => {
                setConfigCombo(c);
                setError(null);
              }}
            />
          )}

          {paso === 'Configuración' &&
            (tipoAccion === 'alerta_vencimiento' ||
              tipoAccion === 'alerta_stock') && (
              <PasoAlerta
                tipo={tipoAccion}
                config={configAlerta}
                onCambiar={(c) => {
                  setConfigAlerta(c);
                  setError(null);
                }}
              />
            )}

          {paso === 'Configuración' && tipoAccion === 'bloquear_venta' && (
            <div className="py-8 text-center">
              <p className="text-sm text-neutral-600">
                Esta regla bloqueará cualquier venta de productos sin stock.
                <br />
                No requiere configuración adicional.
              </p>
            </div>
          )}

          {paso === 'Revisión' && tipoAccion && (
            <PasoRevision
              tipo={tipoAccion}
              nombre={
                nombre.trim() ||
                (tipoAccion === 'descuento_combo'
                  ? configCombo.nombre
                  : 'Regla nueva')
              }
              prioridad={prioridad}
              configCombo={configCombo}
              configAlerta={configAlerta}
              productos={productos}
            />
          )}

          {error && (
            <div className="mt-4 flex items-start gap-3 border-l-2 border-rose-500 bg-rose-50 px-4 py-3">
              <span className="text-rose-600 font-bold text-xs shrink-0">!</span>
              <p className="text-xs text-rose-900 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Footer con navegación */}
        <footer className="border-t border-neutral-200 px-6 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={esPrimero ? cerrar : anterior}
            className="flex items-center gap-2 border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:border-neutral-900 hover:text-neutral-950 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {esPrimero ? 'Cancelar' : 'Atrás'}
          </button>

          {esUltimo ? (
            <button
              onClick={guardar}
              disabled={crear.isPending}
              className="flex items-center gap-2 bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              {crear.isPending ? 'Creando regla...' : 'Crear regla'}
            </button>
          ) : (
            <button
              onClick={siguiente}
              className="flex items-center gap-2 bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-700 transition-colors"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}