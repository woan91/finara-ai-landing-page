import { Shield } from "lucide-react";
import { useI18n } from "./i18n";

const STEPS_EN = [
  {
    num: "01",
    title: "Tell us about your finances",
    desc: "Income, expenses, savings, and goals.",
  },
  {
    num: "02",
    title: "AskFinara analyzes your situation",
    desc: "AI reviews your financial picture in a simple, clear way.",
  },
  {
    num: "03",
    title: "Get clear, beginner-friendly guidance",
    desc: "Understand where you stand and what next step makes sense.",
  },
];

const STEPS_ZH = [
  {
    num: "01",
    title: "告诉我们你的财务状况",
    desc: "收入、支出、储蓄和目标。",
  },
  {
    num: "02",
    title: "AskFinara 分析你的情况",
    desc: "AI 以简单清晰的方式全面审视你的财务状况。",
  },
  {
    num: "03",
    title: "获得清晰、易懂的指导",
    desc: "了解你目前的财务状况，以及下一步该怎么做。",
  },
];

export function HowItWorks() {
  const { lang } = useI18n();
  const steps = lang === "zh" ? STEPS_ZH : STEPS_EN;
  const title = lang === "zh" ? "AskFinara 如何运作" : "How AskFinara Works";
  const tagline = lang === "zh" ? "没有推销。没有复杂术语。只有财务清晰。" : "No hard selling. No confusing jargon. Just financial clarity.";
  const privacy = lang === "zh" ? "你的信息保持私密和安全。" : "Your information stays private and secure.";

  return (
    <section className="py-16 sm:py-24 bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-5xl tracking-tight">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col gap-4"
            >
              <div className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                {step.num}
              </div>
              <div>
                <h3 className="font-semibold text-base leading-snug mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center space-y-3">
          <p className="text-base font-medium text-foreground/80">{tagline}</p>
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Shield className="size-3.5 text-primary shrink-0" />
            {privacy}
          </p>
        </div>
      </div>
    </section>
  );
}
