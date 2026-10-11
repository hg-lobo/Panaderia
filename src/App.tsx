// src/App.tsx

import { useState } from 'react';
import { useAuth } from './features/auth/hooks/useAuth';
import { AuthPage } from './features/auth/AuthPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { PanelLayout } from './features/panel/PanelLayout';
import { DashboardPage } from './features/panel/DashboardPage';
import { ProductosPage } from './features/panel/ProductosPage';
import { CombosPage } from './features/panel/CombosPage';
import { PosPage } from './features/pos/PosPage';
import { DevolucionesPage } from './features/panel/DevolucionesPage';
import { ReportesPage } from './features/panel/ReportesPage';
import { ReglasPage } from './features/panel/ReglasPage';
import { PerfilPage } from './features/panel/PerfilPage';
import { NotFoundPage } from './features/panel/NotFoundPage';
import type { RutaPanel } from './features/panel/components/Sidebar';

interface MetaRuta {
  readonly titulo: string;
  readonly subtitulo: string;
}

const META: Record<RutaPanel, MetaRuta> = {
  dashboard:    { titulo: 'Dashboard', subtitulo: 'Métricas y control' },
  pos:          { titulo: 'Punto de venta', subtitulo: 'Registrar transacción' },
  productos:    { titulo: 'Productos', subtitulo: 'Gestión de inventario' },
  combos:       { titulo: 'Combos', subtitulo: 'Ofertas y promociones' },
  devoluciones: { titulo: 'Devoluciones', subtitulo: 'Control de riesgos' },
  reportes:     { titulo: 'Reportes', subtitulo: 'Análisis avanzado' },
  reglas:       { titulo: 'Reglas', subtitulo: 'Automatizaciones del sistema' },
};

/**
 * Analiza la URL actual para determinar:
 * - Si estamos en el flujo de reset password
 * - Si la ruta es inválida (404)
 */
function analizarUrl(): {
  esResetPassword: boolean;
  rutaInvalida: string | null;
} {
  const path = window.location.pathname;
  const hash = window.location.hash;

  // Supabase nos devuelve a /reset-password con un hash que contiene
  // access_token para el flujo de recuperación.
  const esResetPassword = path === '/reset-password';

  // Si hay path distinto de "/" y no es /reset-password, es 404
  const rutaInvalida =
    !esResetPassword && path !== '/' && path !== '' ? path : null;

  // Excluir el hash de Supabase del análisis (viene en formato #access_token=)
  void hash;

  return { esResetPassword, rutaInvalida };
}

export default function App() {
  const { sesion, perfil, cargando, cerrarSesion } = useAuth();
  const [ruta, setRuta] = useState<RutaPanel>('dashboard');
  const [verPerfil, setVerPerfil] = useState(false);
  const [urlInfo] = useState(analizarUrl);

  // 1. Cargando
  if (cargando) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 animate-spin" />
          <p className="mt-6 text-xs font-semibold tracking-[0.3em] uppercase text-neutral-600">
            Verificando sesión
          </p>
        </div>
      </div>
    );
  }

  // 2. Reset password (flujo del email)
  if (urlInfo.esResetPassword) {
    return <ResetPasswordPage />;
  }

  // 3. Sin sesión → login
  if (!sesion) {
    return <AuthPage />;
  }

  // 4. Ruta inválida → 404
  if (urlInfo.rutaInvalida) {
    return (
      <PanelLayout
        rutaActiva="dashboard"
        onNavegar={setRuta}
        perfil={perfil}
        email={sesion.user.email ?? ''}
        onCerrarSesion={cerrarSesion}
        onVerPerfil={() => setVerPerfil(true)}
        titulo="Error 404"
        subtitulo="Ruta no encontrada"
      >
        <NotFoundPage
          rutaIntentada={urlInfo.rutaInvalida}
          onVolver={() => {
            window.history.replaceState({}, '', '/');
            window.location.reload();
          }}
        />
      </PanelLayout>
    );
  }

  // 5. Perfil abierto
  if (verPerfil) {
    return (
      <PanelLayout
        rutaActiva={ruta}
        onNavegar={(r) => {
          setVerPerfil(false);
          setRuta(r);
        }}
        perfil={perfil}
        email={sesion.user.email ?? ''}
        onCerrarSesion={cerrarSesion}
        onVerPerfil={() => setVerPerfil(true)}
        titulo="Mi perfil"
        subtitulo="Información de la cuenta"
      >
        <PerfilPage />
      </PanelLayout>
    );
  }

  // 6. Navegación normal
  const meta = META[ruta];

  return (
    <PanelLayout
      rutaActiva={ruta}
      onNavegar={setRuta}
      perfil={perfil}
      email={sesion.user.email ?? ''}
      onCerrarSesion={cerrarSesion}
      onVerPerfil={() => setVerPerfil(true)}
      titulo={meta.titulo}
      subtitulo={meta.subtitulo}
    >
      {ruta === 'dashboard' && <DashboardPage />}
      {ruta === 'pos' && <PosPage />}
      {ruta === 'productos' && <ProductosPage />}
      {ruta === 'combos' && <CombosPage />}
      {ruta === 'devoluciones' && <DevolucionesPage />}
      {ruta === 'reportes' && <ReportesPage />}
      {ruta === 'reglas' && <ReglasPage />}
    </PanelLayout>
  );
}