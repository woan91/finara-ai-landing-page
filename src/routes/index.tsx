import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/finara/Nav";
import { Hero } from "@/components/finara/Hero";
import { Features } from "@/components/finara/Features";
import { Calculator } from "@/components/finara/Calculator";
import { CTA } from "@/components/finara/CTA";
import { I18nProvider } from "@/components/finara/i18n";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Finara AI — Your AI Financial Companion" },
      { name: "description", content: "Plan savings goals, improve financial habits, and build a better future with AI. Built for young professionals and overseas workers." },
      { property: "og:title", content: "Finara AI — Your AI Financial Companion" },
      { property: "og:description", content: "AI savings goal planner for the next generation of earners." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Noto+Serif+SC:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" },
    ],
  }),
});

function Index() {
  return (
    <I18nProvider>
      <main className="min-h-screen">
        <Nav />
        <Hero />
        <Features />
        <Calculator />
        <CTA />
      </main>
    </I18nProvider>
  );
}
