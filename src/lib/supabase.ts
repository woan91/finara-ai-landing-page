import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!rawUrl || !rawAnonKey) {
    cached = null;
    return cached;
  }

  const url = rawUrl.trim().replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const anonKey = rawAnonKey.trim();

  if (import.meta.env.DEV) {
    let host: string | null = null;
    try {
      host = new URL(url).host;
    } catch {}
    console.info("[supabase] init", { hasUrl: url.length > 0, hasAnonKey: anonKey.length > 0, host });
  }

  try {
    cached = createClient(url, anonKey);
  } catch (e) {
    if (import.meta.env.DEV) console.error("[supabase] createClient failed", e);
    cached = null;
  }
  return cached;
}
