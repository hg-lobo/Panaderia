// src/features/auth/AuthPage.tsx

import { AuthForm } from './components/AuthForm';

/**
 * Página de autenticación.
 * Por ahora solo renderiza el formulario. En el futuro puede incluir
 * branding, animaciones o un carrusel lateral.
 */
export function AuthPage() {
  return <AuthForm />;
}