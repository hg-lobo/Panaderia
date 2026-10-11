// src/infrastructure/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '❌ Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY. Revisa tu archivo .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: true,    // ← CLAVE para OAuth
    persistSession: true,         // ← Guarda sesión en localStorage
    autoRefreshToken: true,       // ← Refresca el token solo
    flowType: 'pkce',             // ← Flujo OAuth seguro para SPAs
  },
});