import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  // Never cache during SSR — import.meta.env is not available server-side in
  // TanStack Start, so a null result would be frozen into the singleton forever.
  const isServer = typeof window === "undefined";

  if (!isServer && cached !== undefined) return cached;

  const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!rawUrl || !rawAnonKey) {
    if (!isServer) cached = null;
    return null;
  }

  const url = rawUrl.trim().replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  const anonKey = rawAnonKey.trim();

  let client: SupabaseClient | null = null;
  try {
    client = createClient(url, anonKey);
  } catch (e) {
    console.error("[supabase] createClient failed", e);
    if (!isServer) cached = null;
    return null;
  }

  if (!isServer) cached = client;
  return client;
}
