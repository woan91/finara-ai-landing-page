import { Brain, Target, Globe2, LineChart, Wallet, Lock } from "lucide-react";

const features = [
  { icon: Brain, title: "AI Savings Coach", desc: "Personalized nudges that learn your income patterns and spending habits." },
  { icon: Target, title: "Goal Planner", desc: "Turn dreams into milestones — homes, weddings, travel, emergencies." },
  { icon: Globe2, title: "Built for OFWs", desc: "Multi-currency, remittance-aware, and timezone-friendly insights." },
  { icon: LineChart, title: "Habit Insights", desc: "See where money leaks and how small changes compound over time." },
  { icon: Wallet, title: "Smart Auto-Save", desc: "Round-ups and rules quietly grow your goals in the background." },
  { icon: Lock, title: "Private & Secure", desc: "End-to-end encryption. Your data is yours — never sold, ever." },
];

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Why Finara</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight">
            Money clarity, <span className="text-gradient italic">designed for life</span>.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Six quietly powerful tools, one calm interface. Finara handles the math so you can focus on the moments.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative rounded-3xl bg-card p-7 shadow-card border border-border hover:-translate-y-1 transition-transform duration-300"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="size-11 rounded-2xl grid place-items-center bg-primary-gradient text-primary-foreground shadow-glow">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
