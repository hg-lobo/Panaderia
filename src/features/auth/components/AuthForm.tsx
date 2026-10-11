// src/features/auth/components/AuthForm.tsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight, Mail, Lock, User, AlertCircle, Check,
  ArrowLeft, Sparkles, Shield, Zap, TrendingUp,
} from 'lucide-react';
import {
  loginSchema, registerSchema, recuperarSchema,
  type LoginInput, type RegisterInput, type RecuperarInput,
} from '@/core/domain/schemas/auth.schema';
import { useAuth } from '../hooks/useAuth';

type Modo = 'login' | 'registro' | 'recuperar';

export function AuthForm() {
  const [modo, setModo] = useState<Modo>('login');
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const {
    iniciarSesion, registrar, iniciarConGoogle, recuperarPassword,
  } = useAuth();

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const recuperarForm = useForm<RecuperarInput>({
    resolver: zodResolver(recuperarSchema),
    defaultValues: { email: '' },
  });

  /* ============================================================
     HANDLERS
     ============================================================ */
  const onSubmitLogin = async (data: LoginInput) => {
    setErrorGlobal(null);
    setExito(null);
    setCargando(true);
    try {
      await iniciarSesion(data.email, data.password);
    } catch (err) {
      setErrorGlobal(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  const onSubmitRegister = async (data: RegisterInput) => {
    setErrorGlobal(null);
    setExito(null);
    setCargando(true);
    try {
      await registrar(data.email, data.password);
    } catch (err) {
      setErrorGlobal(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  const onSubmitRecuperar = async (data: RecuperarInput) => {
    setErrorGlobal(null);
    setExito(null);
    setCargando(true);
    try {
      await recuperarPassword(data.email);
      setExito(
        'Si el correo existe, recibirás un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada y la carpeta de spam.',
      );
      recuperarForm.reset();
    } catch (err) {
      setErrorGlobal(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setCargando(false);
    }
  };

  const onGoogle = async () => {
    setErrorGlobal(null);
    setExito(null);
    setCargando(true);
    try {
      await iniciarConGoogle();
    } catch (err) {
      setErrorGlobal(err instanceof Error ? err.message : 'Error desconocido');
      setCargando(false);
    }
  };

  const cambiarModo = (nuevo: Modo) => {
    setModo(nuevo);
    setErrorGlobal(null);
    setExito(null);
    loginForm.reset();
    registerForm.reset();
    recuperarForm.reset();
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="min-h-screen bg-stone-100 flex">
      {/* ============================================================
          LADO IZQUIERDO — Imagen + branding con logo
          ============================================================ */}
      <aside className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Imagen de fondo */}
        <img
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=80"
          alt="Panadería Don Christopher"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />

        {/* Overlay oscuro + tinte cálido */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/95 via-neutral-950/85 to-amber-950/70" />

        {/* Capa decorativa: puntos sutiles */}
        <div className="absolute inset-0 bg-dots opacity-25" />

        {/* Brillo decorativo con tono cálido */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-600/15 blur-[100px] rounded-full" />

        {/* Contenido */}
        <div className="relative z-10 flex flex-col justify-between p-14 w-full">
          {/* Marca superior con logo */}
          <div className="flex items-center gap-3 animate-fade-in">
            <LogoPanaderia tamaño="grande" />
            <div className="flex flex-col">
              <span className="font-display text-white text-sm font-bold tracking-[0.15em] uppercase leading-tight">
                El Horno de
              </span>
              <span className="font-display text-amber-400 text-sm font-bold tracking-[0.15em] uppercase leading-tight">
                Don Christopher
              </span>
            </div>
          </div>

          {/* Texto central */}
          <div className="max-w-xl animate-fade-in-up delay-100">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-amber-400" />
              <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-amber-300">
                Sistema de Punto de Venta
              </p>
            </div>

            <h1 className="font-display text-5xl xl:text-6xl font-bold text-white leading-[0.98] tracking-tight mb-8">
              El pan se
              <br />
              vende solo
              <br />
              <span className="text-white/40">cuando el sistema</span>
              <br />
              <span className="text-amber-400">trabaja bien.</span>
            </h1>

            <p className="text-white/70 text-base leading-relaxed max-w-md">
              Inventario, ventas, promociones automáticas y control de riesgos
              en una sola consola. Del horno al mostrador, sin sorpresas.
            </p>
          </div>

          {/* Características inferiores */}
          <div className="grid grid-cols-3 gap-8 border-t border-white/15 pt-8 animate-fade-in-up delay-300">
            <Feature
              icono={<Zap className="h-4 w-4" />}
              texto="Descuentos automáticos"
            />
            <Feature
              icono={<Shield className="h-4 w-4" />}
              texto="Control de stock"
            />
            <Feature
              icono={<TrendingUp className="h-4 w-4" />}
              texto="Análisis en tiempo real"
            />
          </div>
        </div>
      </aside>

      {/* ============================================================
          LADO DERECHO — Formulario con logo arriba
          ============================================================ */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-stone-100 bg-grid">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Logo + nombre de la panadería */}


          {/* Encabezado dinámico */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px w-8 bg-accent-600" />
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-accent-700">
                {modo === 'login' && 'Acceso'}
                {modo === 'registro' && 'Registro'}
                {modo === 'recuperar' && 'Recuperar acceso'}
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold text-neutral-950 tracking-tight">
              {modo === 'login' && 'Iniciar sesión'}
              {modo === 'registro' && 'Crear cuenta'}
              {modo === 'recuperar' && 'Recuperar contraseña'}
            </h2>
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
              {modo === 'login' &&
                'Ingresa tus credenciales para acceder al panel.'}
              {modo === 'registro' &&
                'Completa el formulario para registrar un nuevo administrador.'}
              {modo === 'recuperar' &&
                'Te enviaremos un enlace para restablecer tu contraseña.'}
            </p>
          </div>

          {/* Botón Google (solo login y registro) */}
          {modo !== 'recuperar' && (
            <>
              <button
                type="button"
                onClick={onGoogle}
                disabled={cargando}
                className="w-full flex items-center justify-center gap-3 border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 hover:border-neutral-900 hover:bg-neutral-50 disabled:opacity-50 transition-all duration-200"
              >
                <GoogleIcon />
                <span>Continuar con Google</span>
              </button>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-neutral-300" />
                <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-neutral-500">
                  o con correo
                </span>
                <div className="h-px flex-1 bg-neutral-300" />
              </div>
            </>
          )}

          {/* FORMULARIO: LOGIN */}
          {modo === 'login' && (
            <form
              onSubmit={loginForm.handleSubmit(onSubmitLogin)}
              className="space-y-5"
            >
              <Campo
                label="Correo electrónico"
                type="email"
                placeholder="admin@donchristopher.com"
                autoComplete="email"
                icono={<Mail className="h-4 w-4" />}
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email')}
              />
              <Campo
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                icono={<Lock className="h-4 w-4" />}
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register('password')}
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => cambiarModo('recuperar')}
                  className="text-xs font-semibold text-neutral-700 hover:text-accent-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {errorGlobal && <AlertaError mensaje={errorGlobal} />}

              <BotonPrincipal cargando={cargando} texto="Acceder al panel" />
            </form>
          )}

          {/* FORMULARIO: REGISTRO */}
          {modo === 'registro' && (
            <form
              onSubmit={registerForm.handleSubmit(onSubmitRegister)}
              className="space-y-5"
            >
              <Campo
                label="Correo electrónico"
                type="email"
                placeholder="admin@donchristopher.com"
                autoComplete="email"
                icono={<Mail className="h-4 w-4" />}
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register('email')}
              />
              <Campo
                label="Contraseña"
                type="password"
                placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número"
                autoComplete="new-password"
                icono={<Lock className="h-4 w-4" />}
                error={registerForm.formState.errors.password?.message}
                {...registerForm.register('password')}
              />
              <Campo
                label="Confirmar contraseña"
                type="password"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                icono={<User className="h-4 w-4" />}
                error={registerForm.formState.errors.confirmPassword?.message}
                {...registerForm.register('confirmPassword')}
              />

              {errorGlobal && <AlertaError mensaje={errorGlobal} />}

              <BotonPrincipal cargando={cargando} texto="Crear cuenta" />
            </form>
          )}

          {/* FORMULARIO: RECUPERAR CONTRASEÑA */}
          {modo === 'recuperar' && (
            <form
              onSubmit={recuperarForm.handleSubmit(onSubmitRecuperar)}
              className="space-y-5"
            >
              <div className="flex items-start gap-3 border-l-2 border-accent-600 bg-accent-50/50 px-4 py-3 mb-2">
                <Sparkles className="h-4 w-4 text-accent-700 shrink-0 mt-0.5" />
                <p className="text-xs text-accent-900 leading-relaxed">
                  Ingresa tu correo y te enviaremos un enlace para crear una
                  nueva contraseña. El enlace expira en 1 hora.
                </p>
              </div>

              <Campo
                label="Correo electrónico"
                type="email"
                placeholder="tu-correo@ejemplo.com"
                autoComplete="email"
                icono={<Mail className="h-4 w-4" />}
                error={recuperarForm.formState.errors.email?.message}
                {...recuperarForm.register('email')}
              />

              {errorGlobal && <AlertaError mensaje={errorGlobal} />}
              {exito && <AlertaExito mensaje={exito} />}

              <BotonPrincipal cargando={cargando} texto="Enviar enlace" />

              <button
                type="button"
                onClick={() => cambiarModo('login')}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors pt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al inicio de sesión
              </button>
            </form>
          )}

          {/* Cambio de modo (solo login/registro) */}
          {modo !== 'recuperar' && (
            <div className="mt-8 pt-6 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-sm text-neutral-600">
                {modo === 'login'
                  ? '¿No tienes cuenta?'
                  : '¿Ya tienes cuenta?'}
              </span>
              <button
                type="button"
                onClick={() =>
                  cambiarModo(modo === 'login' ? 'registro' : 'login')
                }
                className="group flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-neutral-900 hover:text-accent-700 transition-colors"
              >
                {modo === 'login' ? 'Registrarse' : 'Iniciar sesión'}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Footer con nombre del sistema */}
          <p className="mt-8 text-center text-[10px] tracking-wider uppercase text-neutral-400">
            El Horno de Don Christopher · {new Date().getFullYear()}
          </p>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   Subcomponentes
   ============================================================ */

/**
 * Logo de la panadería con fallback a emoji 🥖.
 * Se usa en el sidebar y en el login.
 */
function LogoPanaderia({ tamaño }: { tamaño: 'grande' | 'pequeño' }) {
  const clase =
    tamaño === 'grande'
      ? 'h-11 w-11 border-2'
      : 'h-10 w-10 border';

  return (
    <div
      className={`${clase} `}
    >
      <img
        src="/logo-don-christopher.png"
        alt="El Horno de Don Christopher"
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const padre = e.currentTarget.parentElement;
          if (padre && !padre.querySelector('.emoji-fallback')) {
            const span = document.createElement('span');
            span.className = 'emoji-fallback';
            span.style.fontSize = tamaño === 'grande' ? '20px' : '18px';
            span.style.lineHeight = '1';
            span.textContent = '🥖';
            padre.appendChild(span);
          }
        }}
      />
    </div>
  );
}

function Feature({
  icono, texto,
}: {
  icono: React.ReactNode;
  texto: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <span className="h-8 w-8 border border-amber-500/30 flex items-center justify-center text-amber-400">
        {icono}
      </span>
      <p className="text-[10px] font-semibold tracking-wider uppercase text-white/60 leading-tight">
        {texto}
      </p>
    </div>
  );
}

interface CampoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icono?: React.ReactNode;
}

function Campo({ label, error, icono, ...rest }: CampoProps) {
  return (
    <div>
      <label className="flex items-center justify-between text-xs font-semibold text-neutral-800 mb-2">
        <span>{label}</span>
        {error && (
          <span className="text-rose-600 font-medium text-xs">{error}</span>
        )}
      </label>
      <div className="relative">
        {icono && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
            {icono}
          </div>
        )}
        <input
          {...rest}
          className={`w-full bg-white border ${
            error
              ? 'border-rose-400 focus:border-rose-600'
              : 'border-neutral-400 focus:border-neutral-900'
          } ${icono ? 'pl-10' : 'pl-3.5'} pr-3.5 py-3 text-sm text-neutral-950 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition-all`}
        />
      </div>
    </div>
  );
}

function AlertaError({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex items-start gap-3 border-l-2 border-rose-500 bg-rose-50 px-4 py-3 animate-fade-in">
      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
      <p className="text-xs text-rose-900 leading-relaxed font-medium">
        {mensaje}
      </p>
    </div>
  );
}

function AlertaExito({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex items-start gap-3 border-l-2 border-accent-600 bg-accent-50 px-4 py-3 animate-fade-in">
      <Check className="h-4 w-4 text-accent-700 shrink-0 mt-0.5" />
      <p className="text-xs text-accent-900 leading-relaxed font-medium">
        {mensaje}
      </p>
    </div>
  );
}

function BotonPrincipal({
  cargando, texto,
}: {
  cargando: boolean;
  texto: string;
}) {
  return (
    <button
      type="submit"
      disabled={cargando}
      className="group relative w-full flex items-center justify-between bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-accent-700 disabled:opacity-50 transition-colors duration-200 overflow-hidden"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      <span className="tracking-wide relative">
        {cargando ? 'Procesando...' : texto}
      </span>
      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform relative" />
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}