import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useI18n } from "./i18n";

export function Nav() {
  const { t, lang, setLang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
        <nav className="glass rounded-full flex items-center justify-between px-4 sm:px-5 py-2.5 shadow-card relative">
          <a href="#" className="flex items-center gap-2 font-semibold">
            <span className="grid place-items-center size-8 rounded-full bg-primary-gradient text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span>Ask<span className="text-muted-foreground font-normal">Finara</span></span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">{t.nav.features}</a>
            <a href="#calculator" className="hover:text-foreground transition">{t.nav.planner}</a>
            <a href="#cta" className="hover:text-foreground transition">{t.nav.getStarted}</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-full border border-border bg-card/60 p-2 text-muted-foreground hover:text-foreground transition"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
            <div
              role="group"
              aria-label="Language"
              className="inline-flex items-center rounded-full border border-border bg-card/60 p-0.5 text-xs"
            >
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2.5 py-1 rounded-full transition ${lang === "en" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                aria-pressed={lang === "en"}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("zh")}
                className={`px-2.5 py-1 rounded-full transition ${lang === "zh" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                aria-pressed={lang === "zh"}
              >
                中文
              </button>
            </div>
            <a href="#cta" className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition">
              {t.nav.waitlist}
            </a>
          </div>
          {menuOpen && (
            <div className="md:hidden absolute left-0 right-0 top-full mt-2 px-2">
              <div className="rounded-2xl border border-border bg-background/95 backdrop-blur shadow-card p-3">
                <div className="grid gap-1 text-sm">
                  <a
                    href="#features"
                    className="rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t.nav.features}
                  </a>
                  <a
                    href="#calculator"
                    className="rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t.nav.planner}
                  </a>
                  <a
                    href="#cta"
                    className="rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t.nav.getStarted}
                  </a>
                </div>
                <a
                  href="#cta"
                  className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:opacity-90 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  {t.nav.waitlist}
                </a>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
