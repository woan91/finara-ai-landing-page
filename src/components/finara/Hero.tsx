import { ArrowRight, ShieldCheck, Star, Lock, ChartBar as BarChart2, Globe as Globe2 } from "lucide-react";
import { useI18n } from "./i18n";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-hero pt-28 sm:pt-36 pb-16 sm:pb-24">
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-20 size-[420px] rounded-full bg-mesh opacity-30 blur-3xl animate-blob" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-10 size-[480px] rounded-full bg-mesh opacity-25 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-7 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground mb-6 max-w-full truncate">
            <Star className="size-3.5 fill-primary text-primary shrink-0" />
            <span className="truncate">{t.hero.badge}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
            {t.hero.title1}<span className="text-gradient italic">{t.hero.title2}{t.hero.titleEnd}</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            {t.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#snapshot"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("snapshot")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group inline-flex items-center gap-2 rounded-full bg-primary-gradient text-primary-foreground px-6 py-3.5 text-sm font-medium shadow-glow hover:scale-[1.02] transition-transform"
            >
              {t.hero.primaryCta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#calculator" className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium border border-border bg-card hover:bg-accent transition">
              {t.hero.secondaryCta}
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{t.hero.heroCta2}</p>

          {/* Trust row */}
          <TrustRow items={t.hero.trust} />
        </div>

        <div className="lg:col-span-5 animate-fade-up delay-200">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

const TRUST_ICONS = [
  <Lock className="size-3.5" />,
  <BarChart2 className="size-3.5" />,
  <Globe2 className="size-3.5" />,
];

function TrustRow({ items }: { items: { label: string; desc: string }[] }) {
  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-3">
      {items.map(({ label, desc }, i) => (
        <div key={label} className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 text-primary">{TRUST_ICONS[i]}</span>
          <div>
            <div className="text-xs font-semibold text-foreground/80 leading-snug">{label}</div>
            <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PhoneMockup() {
  const { t } = useI18n();
  const p = t.hero.phone;
  return (
    <div className="relative mx-auto max-w-[320px] animate-float">
      <div className="absolute -inset-6 bg-mesh opacity-40 blur-2xl rounded-[3rem]" />
      <div className="relative rounded-[2.5rem] bg-foreground p-2 shadow-glow">
        <div className="rounded-[2rem] bg-background overflow-hidden">
          <div className="px-6 pt-6 pb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>9:41</span>
            <span className="size-2 rounded-full bg-accent-mint" />
          </div>
          <div className="px-6 pt-2">
            <p className="text-xs text-muted-foreground">{p.greeting}</p>
            <h3 className="font-display text-2xl mt-1">{p.goal}</h3>
          </div>
          <div className="px-6 mt-4">
            <div className="rounded-2xl p-4 bg-primary-gradient text-primary-foreground shadow-card">
              <div className="flex items-baseline justify-between">
                <span className="text-xs opacity-80">{p.saved}</span>
                <span className="text-xs opacity-80">68%</span>
              </div>
              <div className="mt-1 text-3xl font-semibold">$3,420</div>
              <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full w-[68%] bg-white rounded-full" />
              </div>
              <div className="mt-2 text-[11px] opacity-80">{p.ofTarget}</div>
            </div>
          </div>
          <div className="px-6 mt-4 space-y-2">
            {[
              { label: p.tip, value: "+$36" },
              { label: p.autoSave, value: "+$120" },
              { label: p.roundUps, value: "+$8.40" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5 text-sm">
                <span className="text-foreground">{r.label}</span>
                <span className="font-medium" style={{ color: "oklch(0.55 0.15 165)" }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="px-6 mt-5 pb-6">
            <button className="w-full rounded-full bg-foreground text-background text-sm py-3 font-medium">{p.ask}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
