import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/disclaimer")({
  component: Disclaimer,
  head: () => ({
    meta: [{ title: "Disclaimer — Finara AI" }],
  }),
});

function Disclaimer() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">
          ← Back
        </Link>
        <h1 className="mt-6 font-display text-4xl tracking-tight">Disclaimer</h1>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Finara AI provides educational financial insights only and does not offer financial, legal, or investment
            advice.
          </p>
          <p>
            Beta content may be incomplete or inaccurate. Always verify information independently and consult a
            qualified professional for decisions.
          </p>
        </div>
      </div>
    </main>
  );
}

