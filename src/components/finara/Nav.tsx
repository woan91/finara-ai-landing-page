import { Sparkles } from "lucide-react";

export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <nav className="glass rounded-full flex items-center justify-between px-5 py-2.5 shadow-card">
          <a href="#" className="flex items-center gap-2 font-semibold">
            <span className="grid place-items-center size-8 rounded-full bg-primary-gradient text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span>Finara<span className="text-muted-foreground font-normal"> AI</span></span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#calculator" className="hover:text-foreground transition">Planner</a>
            <a href="#cta" className="hover:text-foreground transition">Get started</a>
          </div>
          <a href="#cta" className="text-sm font-medium px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition">
            Join waitlist
          </a>
        </nav>
      </div>
    </header>
  );
}
