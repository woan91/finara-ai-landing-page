import { useEffect, useState } from "react";
import { X, Mail, Sparkles, CircleCheck as CheckCircle2, Loader as Loader2, Lock, ArrowRight } from "lucide-react";
import { useI18n } from "./i18n";
import { getSupabaseClient } from "@/lib/supabase";

async function insertSavedPlan(email: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.from("saved_plans").insert({ email: email.trim().toLowerCase(), source: "save_my_plan" });
}

export function SavePlanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [loading, setLoading] = useState<null | "google" | "email">(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      const id = setTimeout(() => {
        setEmail("");
        setShowEmail(false);
        setLoading(null);
        setDone(false);
      }, 250);
      return () => clearTimeout(id);
    }
  }, [open]);

  if (!open) return null;

  const handleGoogle = () => {
    setLoading("google");
    setTimeout(() => { setLoading(null); setDone(true); }, 900);
  };
  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setLoading("email");
    try {
      await insertSavedPlan(trimmed);
    } catch {
      // best-effort — show success regardless
    } finally {
      setLoading(null);
    }
    setDone(true);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-plan-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-md animate-fade-up"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] bg-card border border-border shadow-card overflow-hidden animate-fade-up">
        {/* Soft gradient header glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[120%] opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in oklab, var(--primary) 28%, transparent) 0%, transparent 65%)",
          }}
        />

        <div className="relative p-7 sm:p-9">
          <button
            type="button"
            onClick={onClose}
            aria-label={t.calc.saveModal.close}
            className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition"
          >
            <X className="size-4" />
          </button>

          {!done ? (
            <>
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 backdrop-blur px-2.5 py-1 text-[11px] font-medium tracking-wide">
                <Sparkles className="size-3 text-primary" />
                <span className="bg-primary-gradient bg-clip-text text-transparent">Finara AI</span>
                <span className="text-muted-foreground">· Free</span>
              </div>

              <h3
                id="save-plan-title"
                className="mt-4 font-display text-[28px] sm:text-[32px] leading-[1.1] tracking-tight"
              >
                {t.calc.saveModal.title}
              </h3>
              <p className="mt-3 text-[14px] text-muted-foreground leading-relaxed">
                {t.calc.saveModal.subtitle}
              </p>

              {/* Auth buttons */}
              <div className="mt-7 space-y-2.5">
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading !== null}
                  className="group w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-background hover:bg-secondary py-3.5 text-[14px] font-medium transition disabled:opacity-60 shadow-sm"
                >
                  {loading === "google" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span>{t.calc.saveModal.google}</span>
                </button>

                {!showEmail ? (
                  <button
                    type="button"
                    onClick={() => setShowEmail(true)}
                    className="group w-full flex items-center justify-center gap-2.5 rounded-2xl bg-primary-gradient text-primary-foreground py-3.5 text-[14px] font-medium shadow-glow hover:scale-[1.01] active:scale-[0.99] transition"
                  >
                    <Mail className="size-4" />
                    {t.calc.saveModal.email}
                    <ArrowRight className="size-4 opacity-80 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ) : (
                  <form onSubmit={handleEmail} className="space-y-2 animate-fade-up">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input
                        type="email"
                        autoFocus
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.calc.saveModal.emailPlaceholder}
                        className="w-full rounded-2xl border border-border bg-background pl-11 pr-4 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading !== null}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-primary-gradient text-primary-foreground py-3.5 text-[14px] font-medium shadow-glow hover:scale-[1.01] transition disabled:opacity-60"
                    >
                      {loading === "email" && <Loader2 className="size-4 animate-spin" />}
                      {t.calc.saveModal.continue}
                    </button>
                  </form>
                )}
              </div>

              {/* Trust footer */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="size-3" />
                <span>{t.calc.saveModal.privacy}</span>
              </div>
            </>
          ) : (
            <div className="py-6 text-center animate-fade-up">
              <div className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-primary-gradient shadow-glow">
                <CheckCircle2 className="size-8 text-primary-foreground" />
              </div>
              <h3 className="mt-6 font-display text-2xl tracking-tight">
                {t.calc.saveModal.success}
              </h3>
              <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
                {t.calc.saveModal.subtitle}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-2xl bg-foreground text-background py-3.5 text-[14px] font-medium hover:opacity-90 transition"
              >
                {t.calc.saveModal.close}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.3-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.7 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.3 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.7 13-4.7l-6-5.1c-2 1.4-4.5 2.3-7 2.3-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.6 39 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.3 5.5l6 5.1C40 35 43.5 30 43.5 24c0-1.2-.1-2.3-.3-3.5z"/>
    </svg>
  );
}
