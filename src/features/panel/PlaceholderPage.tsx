// src/features/panel/PlaceholderPage.tsx

interface PlaceholderPageProps {
  readonly titulo: string;
  readonly descripcion: string;
}

export function PlaceholderPage({ titulo, descripcion }: PlaceholderPageProps) {
  return (
    <div className="bg-white border border-neutral-300 p-12">
      <div className="max-w-xl">
        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent-700 mb-3">
          Módulo en construcción
        </p>
        <h2 className="text-2xl font-bold text-neutral-950 tracking-tight">
          {titulo}
        </h2>
        <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
          {descripcion}
        </p>
      </div>
    </div>
  );
}