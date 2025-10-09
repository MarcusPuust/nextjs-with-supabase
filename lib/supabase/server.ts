import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Use this on the server (pages, server components, server actions)
 * when you want a normal Supabase client that respects RLS.
 */
export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Use this ONLY in API routes / Edge Functions / server actions
 * that must bypass RLS (admin operations).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // secret; server-only
    { auth: { persistSession: false } }
  );
}

/**
 * Backwards compatibility:
 * If existing code imports { createClient } from "@/lib/supabase/server",
 * keep that working by aliasing it to the safe server (anon) client.
 */
export const createClient = createServerClient;
