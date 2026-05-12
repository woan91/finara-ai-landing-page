import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useI18n } from "./i18n";
import { submitWaitlistEmail } from "@/lib/waitlist";

export function CTA() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [already, setAlready] = useState(false);

  return (
    <section id="cta" className="relative py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground text-background p-10 sm:p-16 shadow-glow">
          <div aria-hidden className="absolute -top-32 -right-20 size-[420px] rounded-full bg-mesh opacity-40 blur-3xl" />
          <div aria-hidden className="absolute -bottom-32 -left-20 size-[360px] rounded-full bg-mesh opacity-30 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="text-xs uppercase tracking-widest opacity-60">{t.cta.eyebrow}</p>
            <h2 className="mt-3 font-display text-4xl sm:text-6xl tracking-tight">
              {t.cta.titleA}<br />{t.cta.titleB}<em className="not-italic text-gradient">{t.cta.titleHighlight}</em>.
            </h2>
            <p className="mt-5 opacity-70 text-lg">
              {t.cta.subtitle}
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (done || loading) return;
                setError(null);
                setAlready(false);
                const result = await (async () => {
                  setLoading(true);
                  try {
                    return await submitWaitlistEmail({ email, source: "cta" });
                  } finally {
                    setLoading(false);
                  }
                })();
                if (result.ok) {
                  setDone(true);
                  if (result.status === "existing") setAlready(true);
                  return;
                }
                if (result.reason === "missing_config") {
                  setError(t.cta.waitlistNotConfigured);
                  return;
                }
                setError(t.cta.waitlistError);
              }}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md"
            >
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t.cta.placeholder}
                className="flex-1 rounded-full bg-background/10 border border-background/20 px-5 py-3.5 text-sm placeholder:text-background/50 outline-none focus:border-background/60 transition"
              />
              <button
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-background text-foreground px-6 py-3.5 text-sm font-medium hover:scale-[1.02] transition disabled:opacity-70"
                disabled={loading}
              >
                {done ? t.cta.success : t.cta.button}
                {!done && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>
            <p className={`mt-4 text-xs ${error || already ? "opacity-80" : "opacity-50"}`}>{error ?? (already ? t.cta.alreadyOnWaitlist : t.cta.nospam)}</p>
          </div>
        </div>

      </div>
    </section>
  );
}
