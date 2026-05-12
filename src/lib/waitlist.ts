import { getSupabaseClient } from "./supabase";

export async function submitWaitlistEmail(input: {
  email: string;
  source: string;
}): Promise<
  | { ok: true; status: "created" | "existing" }
  | { ok: false; reason: "missing_config" | "invalid_email" | "unknown" }
> {
  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, reason: "invalid_email" };

  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, reason: "missing_config" };

  const { error } = await supabase.from("waitlist_signups").insert({
    email,
    source: input.source,
  });

  if (!error) return { ok: true, status: "created" };
  if (error.code === "23505") return { ok: true, status: "existing" };

  if (import.meta.env.DEV) {
    console.error("[waitlist] insert failed", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  return { ok: false, reason: "unknown" };
}
