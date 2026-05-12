import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [{ title: "Contact — Finara AI" }],
  }),
});

function Contact() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">
          ← Back
        </Link>
        <h1 className="mt-6 font-display text-4xl tracking-tight">Contact</h1>
        <div className="mt-6 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>For beta support and inquiries, email:</p>
          <p>
            <a className="text-foreground hover:underline" href="mailto:hello@finara.ai">
              hello@finara.ai
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

