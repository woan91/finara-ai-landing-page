import { Sparkles } from "lucide-react";
import { useI18n } from "./i18n";

export function Nav() {
  const { t, lang, setLang } = useI18n();
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4">
        <nav className="glass rounded-full flex items-center justify-between px-4 sm:px-5 py-2.5 shadow-card">
          <a href="#" className="flex items-center gap-2 font-semibold">
            <span className="grid place-items-center size-8 rounded-full bg-primary-gradient text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span>Finara<span className="text-muted-foreground font-normal"> AI</span></span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">{t.nav.features}</a>
            <a href="#calculator" className="hover:text-foreground transition">{t.nav.planner}</a>
            <a href="#cta" className="hover:text-foreground transition">{t.nav.getStarted}</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
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
        </nav>
      </div>
    </header>
  );
}
