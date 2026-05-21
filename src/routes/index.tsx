import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/finara/Nav";
import { Hero } from "@/components/finara/Hero";
import { HowItWorks } from "@/components/finara/HowItWorks";
import { Features } from "@/components/finara/Features";
import { Calculator } from "@/components/finara/Calculator";
import { TrustSection } from "@/components/finara/TrustSection";
import { CTA } from "@/components/finara/CTA";
import { Footer } from "@/components/finara/Footer";
import { I18nProvider } from "@/components/finara/i18n";
import { ChatWidget } from "@/components/finara/ChatWidget";
import { FinancialSnapshot } from "@/components/finara/FinancialSnapshot";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AskFinara — Financial clarity made simple" },
      { name: "description", content: "Your AI money companion for clearer financial decisions." },
      { property: "og:title", content: "AskFinara — Financial clarity made simple" },
      { property: "og:description", content: "Your AI money companion for clearer financial decisions." },
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
        <HowItWorks />
        <FinancialSnapshot />
        <Features />
        <Calculator />
        <TrustSection />
        <CTA />
        <Footer />
        <ChatWidget />
      </main>
    </I18nProvider>
  );
}
