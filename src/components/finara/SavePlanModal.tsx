import { useEffect, useState } from "react";
import { X, Mail, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { useI18n } from "./i18n";

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
      // reset on close (after animation)
      const id = setTimeout(() => {
        setEmail("");
        setShowEmail(false);
        setLoading(null);
        setDone(false);
      }, 200);
      return () => clearTimeout(id);
    }
  }, [open]);

  if (!open) return null;

  const handleGoogle = () => {
    setLoading("google");
    setTimeout(() => { setLoading(null); setDone(true); }, 900);
  };
  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading("email");
    setTimeout(() => { setLoading(null); setDone(true); }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-plan-title"
    >
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-md animate-fade-up"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-card border border-border shadow-card p-7 sm:p-8 animate-fade-up">
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
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> Finara AI
            </div>
            <h3 id="save-plan-title" className="mt-3 font-display text-3xl tracking-tight">
              {t.calc.saveModal.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {t.calc.saveModal.subtitle}
            </p>

            <div className="mt-7 space-y-3">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 rounded-full border border-border bg-background hover:bg-secondary py-3 text-sm font-medium transition disabled:opacity-60"
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
                  className="w-full flex items-center justify-center gap-3 rounded-full bg-primary-gradient text-primary-foreground py-3 text-sm font-medium shadow-glow hover:scale-[1.01] transition"
                >
                  <Mail className="size-4" />
                  {t.calc.saveModal.email}
                </button>
              ) : (
                <form onSubmit={handleEmail} className="space-y-2 animate-fade-up">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="email"
                      autoFocus
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.calc.saveModal.emailPlaceholder}
                      className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading !== null}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-primary-gradient text-primary-foreground py-3 text-sm font-medium shadow-glow hover:scale-[1.01] transition disabled:opacity-60"
                  >
                    {loading === "email" && <Loader2 className="size-4 animate-spin" />}
                    {t.calc.saveModal.continue}
                  </button>
                </form>
              )}
            </div>

            <p className="mt-6 text-[11px] text-center text-muted-foreground leading-relaxed">
              {t.calc.saveModal.privacy}
            </p>
          </>
        ) : (
          <div className="py-6 text-center animate-fade-up">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[oklch(0.95_0.06_165)]">
              <CheckCircle2 className="size-7 text-[oklch(0.45_0.14_165)]" />
            </div>
            <h3 className="mt-5 font-display text-2xl tracking-tight">
              {t.calc.saveModal.success}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t.calc.saveModal.subtitle}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-foreground text-background py-3 text-sm font-medium hover:opacity-90 transition"
            >
              {t.calc.saveModal.close}
            </button>
          </div>
        )}
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
