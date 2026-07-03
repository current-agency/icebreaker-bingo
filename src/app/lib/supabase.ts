import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const g = globalThis as typeof globalThis & { __supabase?: SupabaseClient };
if (!g.__supabase) {
  g.__supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export const supabase = g.__supabase;
export const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-dff036a6`;

export const serverFetch = (path: string, init: RequestInit = {}) =>
  fetch(`${SERVER_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
      ...(init.headers ?? {}),
    },
  });
