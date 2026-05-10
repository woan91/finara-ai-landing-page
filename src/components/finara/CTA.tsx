import { ArrowRight } from "lucide-react";
import { useState } from "react";

export function CTA() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section id="cta" className="relative py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground text-background p-10 sm:p-16 shadow-glow">
          <div aria-hidden className="absolute -top-32 -right-20 size-[420px] rounded-full bg-mesh opacity-40 blur-3xl" />
          <div aria-hidden className="absolute -bottom-32 -left-20 size-[360px] rounded-full bg-mesh opacity-30 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="text-xs uppercase tracking-widest opacity-60">Join the waitlist</p>
            <h2 className="mt-3 font-display text-4xl sm:text-6xl tracking-tight">
              Build a better<br />financial future, <em className="not-italic text-gradient">today</em>.
            </h2>
            <p className="mt-5 opacity-70 text-lg">
              Be among the first to try Finara AI. Early users get lifetime Pro features, free.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md"
            >
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="flex-1 rounded-full bg-background/10 border border-background/20 px-5 py-3.5 text-sm placeholder:text-background/50 outline-none focus:border-background/60 transition"
              />
              <button className="group inline-flex items-center justify-center gap-2 rounded-full bg-background text-foreground px-6 py-3.5 text-sm font-medium hover:scale-[1.02] transition">
                {done ? "You're in ✓" : "Get early access"}
                {!done && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>
            <p className="mt-4 text-xs opacity-50">No spam. Unsubscribe anytime.</p>
          </div>
        </div>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Finara AI · Crafted with care</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition">Privacy</a>
            <a href="#" className="hover:text-foreground transition">Terms</a>
            <a href="#" className="hover:text-foreground transition">Contact</a>
          </div>
        </footer>
      </div>
    </section>
  );
}
