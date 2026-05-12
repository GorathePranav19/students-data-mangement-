// ── Server-only Supabase utilities ────────────────────────────────────────────
// This file is ONLY safe to import in:
//   - Server Components
//   - API Routes (route.ts files)
//   - Server Actions
// DO NOT import this in Client Components ("use client")

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ── Server Supabase client (uses cookies session) ─────────────────────────────
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Read-only context (Server Component) — can be safely ignored
          }
        },
      },
    }
  );
}

// ── Admin client (service role key — server only) ─────────────────────────────
// Never use this in Client Components. SUPABASE_SERVICE_ROLE_KEY must stay server-side only.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
