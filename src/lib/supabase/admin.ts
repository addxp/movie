import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS. Only use in trusted server-to-server
 * contexts (webhooks, cron jobs), never expose to the browser.
 * Requires SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard → Settings → API).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
