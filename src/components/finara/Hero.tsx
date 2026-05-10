import { ArrowRight, ShieldCheck, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero pt-36 pb-24">
      {/* floating blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-20 size-[420px] rounded-full bg-mesh opacity-30 blur-3xl animate-blob" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-10 size-[480px] rounded-full bg-mesh opacity-25 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />

      <div className="relative mx-auto max-w-6xl px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground mb-6">
            <Star className="size-3.5 fill-primary text-primary" />
            Now in private beta · Built for global earners
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight">
            Your <span className="text-gradient italic">AI Financial</span><br />
            Companion.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl">
            Plan savings goals, improve financial habits, and build a better future with AI — designed for young professionals and overseas workers.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#cta" className="group inline-flex items-center gap-2 rounded-full bg-primary-gradient text-primary-foreground px-6 py-3.5 text-sm font-medium shadow-glow hover:scale-[1.02] transition-transform">
              Start planning free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href="#calculator" className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium border border-border bg-card hover:bg-accent transition">
              See it in action
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Bank-grade security</div>
            <div>·</div>
            <div>Trusted by 12k+ early users</div>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="lg:col-span-5 animate-fade-up delay-200">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

function PhoneMockup() {
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
            <p className="text-xs text-muted-foreground">Good morning, Maya</p>
            <h3 className="font-display text-2xl mt-1">Tokyo Trip Goal</h3>
          </div>
          <div className="px-6 mt-4">
            <div className="rounded-2xl p-4 bg-primary-gradient text-primary-foreground shadow-card">
              <div className="flex items-baseline justify-between">
                <span className="text-xs opacity-80">Saved</span>
                <span className="text-xs opacity-80">68%</span>
              </div>
              <div className="mt-1 text-3xl font-semibold">$3,420</div>
              <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full w-[68%] bg-white rounded-full" />
              </div>
              <div className="mt-2 text-[11px] opacity-80">of $5,000 · on track for Aug</div>
            </div>
          </div>
          <div className="px-6 mt-4 space-y-2">
            {[
              { label: "AI tip · Skip 2 takeouts", value: "+$36" },
              { label: "Auto-save Friday", value: "+$120" },
              { label: "Round-ups", value: "+$8.40" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5 text-sm">
                <span className="text-foreground">{r.label}</span>
                <span className="text-accent-mint font-medium" style={{ color: "oklch(0.55 0.15 165)" }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div className="px-6 mt-5 pb-6">
            <button className="w-full rounded-full bg-foreground text-background text-sm py-3 font-medium">Ask Finara AI</button>
          </div>
        </div>
      </div>
    </div>
  );
}
