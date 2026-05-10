import { Brain, Target, Globe2, LineChart, Wallet, Lock } from "lucide-react";
import { useI18n } from "./i18n";

const icons = [Brain, Target, Globe2, LineChart, Wallet, Lock];

export function Features() {
  const { t } = useI18n();
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">{t.features.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight">
            {t.features.titleA}<span className="text-gradient italic">{t.features.titleB}</span>{t.features.titleEnd}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            {t.features.subtitle}
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.features.items.map((f, i) => {
            const Icon = icons[i];
            return (
              <div
                key={f.title}
                className="group relative rounded-3xl bg-card p-7 shadow-card border border-border hover:-translate-y-1 transition-transform duration-300"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="size-11 rounded-2xl grid place-items-center bg-primary-gradient text-primary-foreground shadow-glow">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
