import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
  head: () => ({
    meta: [{ title: "Privacy Policy — Finara AI" }],
  }),
});

function Privacy() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">
          ← Back
        </Link>
        <h1 className="mt-6 font-display text-4xl tracking-tight">Privacy Policy</h1>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            This page is for beta launch compliance. Replace this text with your final Privacy Policy before public
            launch.
          </p>
          <p>
            For now, we recommend stating what data you collect (e.g. email for waitlist), why you collect it, how long
            you retain it, and how users can request deletion.
          </p>
        </div>
      </div>
    </main>
  );
}

