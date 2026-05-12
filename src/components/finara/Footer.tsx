import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "./i18n";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary-gradient shadow-glow">
                <Sparkles className="size-3.5 text-primary-foreground" />
              </span>
              <span className="font-display text-lg tracking-tight">Finara AI</span>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              {t.cta.disclaimerText}
            </p>
          </div>

          {/* Links */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm sm:grid-cols-4 md:gap-x-12"
          >
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition">
              {t.cta.privacy}
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition">
              {t.cta.terms}
            </Link>
            <Link to="/disclaimer" className="text-muted-foreground hover:text-foreground transition">
              {t.cta.disclaimer}
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition">
              {t.cta.contact}
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col-reverse items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div>© {year} Finara AI · {t.cta.rights}</div>
          <div className="opacity-70">{t.cta.disclaimer}</div>
        </div>
      </div>
    </footer>
  );
}
