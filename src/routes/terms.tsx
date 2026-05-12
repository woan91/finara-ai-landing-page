import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: Terms,
  head: () => ({
    meta: [{ title: "Terms of Service — Finara AI" }],
  }),
});

function Terms() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">
          ← Back
        </Link>
        <h1 className="mt-6 font-display text-4xl tracking-tight">Terms of Service</h1>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            This page is for beta launch compliance. Replace this text with your final Terms of Service before public
            launch.
          </p>
          <p>
            For a beta, consider including acceptable use, no-warranty language, limitations of liability, and how you
            handle account/waitlist communications.
          </p>
        </div>
      </div>
    </main>
  );
}

