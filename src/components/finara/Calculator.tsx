import { useEffect, useMemo, useState } from "react";
import { Sparkles, TrendingUp, Target, Activity, CheckCircle2, AlertTriangle, Lightbulb, ChevronDown } from "lucide-react";
import { useI18n } from "./i18n";

const CATEGORY_KEYS = ["housing", "food", "transport", "shopping", "entertainment", "other"] as const;
type CategoryKey = typeof CATEGORY_KEYS[number];

export function Calculator() {
  const { t } = useI18n();
  const [income, setIncome] = useState(3500);
  const [expenses, setExpenses] = useState(2200);
  const [target, setTarget] = useState(10000);
  const [months, setMonths] = useState(18);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [categories, setCategories] = useState<Record<CategoryKey, string>>({
    housing: "", food: "", transport: "", shopping: "", entertainment: "", other: "",
  });

  const categoryTotal = useMemo(
    () => CATEGORY_KEYS.reduce((sum, k) => sum + (parseFloat(categories[k]) || 0), 0),
    [categories]
  );

  useEffect(() => {
    if (!breakdownOpen) return;
    const total = Math.min(categoryTotal, income);
    setExpenses(Math.round(total));
  }, [categoryTotal, breakdownOpen, income]);

  const metrics = useMemo(() => {
    const disposable = Math.max(0, income - expenses);
    const monthlyNeeded = target / Math.max(1, months);
    const savingsRate = income > 0 ? (disposable / income) * 100 : 0;
    const feasibility = disposable > 0 ? Math.min(1, disposable / monthlyNeeded) : 0;
    const projectedMonths = disposable > 0 ? target / disposable : Infinity;

    // Health score (0-100): weighted blend of savings rate, feasibility, and buffer
    const rateScore = Math.min(100, (savingsRate / 30) * 100); // 30%+ savings rate = full marks
    const feasibilityScore = feasibility * 100;
    const bufferScore = disposable > monthlyNeeded ? 100 : (disposable / Math.max(1, monthlyNeeded)) * 100;
    const health = Math.round(rateScore * 0.4 + feasibilityScore * 0.4 + bufferScore * 0.2);

    const onTrack = disposable >= monthlyNeeded;
    const gap = Math.max(0, monthlyNeeded - disposable);

    return { disposable, monthlyNeeded, savingsRate, feasibility, projectedMonths, health, onTrack, gap };
  }, [income, expenses, target, months]);

  const insights = useMemo(() => {
    const list: { tone: "good" | "warn" | "tip"; text: string }[] = [];

    if (metrics.savingsRate >= 20) {
      list.push({ tone: "good", text: `Your savings rate of ${metrics.savingsRate.toFixed(0)}% is healthy — above the 20% benchmark.` });
    } else if (metrics.savingsRate >= 10) {
      list.push({ tone: "tip", text: `Your savings rate is ${metrics.savingsRate.toFixed(0)}%. Aiming for 20% would accelerate your goal meaningfully.` });
    } else {
      list.push({ tone: "warn", text: `Your savings rate is only ${metrics.savingsRate.toFixed(0)}%. Trim a recurring expense to free up cash flow.` });
    }

    if (metrics.onTrack) {
      list.push({ tone: "good", text: `Your target is realistic — you can comfortably set aside $${metrics.monthlyNeeded.toFixed(0)}/mo.` });
    } else if (metrics.disposable > 0) {
      list.push({ tone: "warn", text: `You're short by $${metrics.gap.toFixed(0)}/mo. Reduce discretionary spending or extend the timeline.` });
    } else {
      list.push({ tone: "warn", text: `Expenses meet or exceed income. Rebalance your budget before committing to a goal.` });
    }

    if (isFinite(metrics.projectedMonths) && metrics.projectedMonths < months) {
      list.push({ tone: "tip", text: `At full disposable income you could hit your goal in ~${Math.ceil(metrics.projectedMonths)} months — ${months - Math.ceil(metrics.projectedMonths)} months sooner.` });
    } else if (!isFinite(metrics.projectedMonths)) {
      list.push({ tone: "tip", text: `Build a $${(income * 0.05).toFixed(0)} starter buffer first — small wins compound.` });
    } else {
      list.push({ tone: "tip", text: `Automate $${(metrics.monthlyNeeded / 2).toFixed(0)} on payday to stay consistent without thinking.` });
    }

    return list;
  }, [metrics, months, income]);

  const eta = isFinite(metrics.projectedMonths)
    ? `${Math.ceil(metrics.projectedMonths)} mo`
    : "—";

  return (
    <section id="calculator" className="relative py-28 bg-hero">
      <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-12 items-start">
        <div className="lg:sticky lg:top-28">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">AI Goal Planner</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight">
            Try the <span className="text-gradient italic">savings preview</span>.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-md">
            Enter your real numbers. Finara calculates your plan, your health score, and what to do next.
          </p>

          <div className="mt-8 space-y-6">
            <Slider label="Monthly income" value={income} min={500} max={20000} step={100} format={(v) => `$${v.toLocaleString()}`} onChange={setIncome} />
            <div>
              <Slider
                label="Monthly expenses"
                value={expenses}
                min={0}
                max={Math.max(income, 1)}
                step={50}
                format={(v) => `$${v.toLocaleString()}`}
                onChange={(v) => { if (breakdownOpen) return; setExpenses(Math.min(v, income)); }}
              />
              <button
                type="button"
                onClick={() => setBreakdownOpen((o) => !o)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
                aria-expanded={breakdownOpen}
              >
                <ChevronDown className={`size-3.5 transition-transform ${breakdownOpen ? "rotate-180" : ""}`} />
                {breakdownOpen ? "Hide breakdown" : "Break down expenses"}
              </button>

              {breakdownOpen && (
                <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4 animate-fade-up">
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORY_KEYS.map((key) => (
                      <CategoryInput
                        key={key}
                        label={CATEGORY_LABELS[key]}
                        value={categories[key]}
                        onChange={(v) => setCategories((c) => ({ ...c, [key]: v }))}
                      />
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Total from categories</span>
                    <span className="font-semibold tabular-nums">${categoryTotal.toLocaleString()} <span className="text-muted-foreground font-normal">/ mo</span></span>
                  </div>
                </div>
              )}
            </div>
            <Slider label="Savings target" value={target} min={500} max={100000} step={500} format={(v) => `$${v.toLocaleString()}`} onChange={setTarget} />
            <Slider label="Timeline" value={months} min={1} max={60} step={1} format={(v) => `${v} months`} onChange={setMonths} />
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card/60 p-4 text-sm flex items-center justify-between">
            <span className="text-muted-foreground">Disposable income</span>
            <span className="font-semibold">${metrics.disposable.toLocaleString()} <span className="text-muted-foreground font-normal">/ mo</span></span>
          </div>
        </div>

        <div className="relative">
          <div aria-hidden className="absolute -inset-8 bg-mesh opacity-30 blur-3xl rounded-[3rem]" />
          <div className="relative rounded-3xl bg-card border border-border p-8 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" /> Finara AI analysis
              </div>
              <StatusPill onTrack={metrics.onTrack} disposable={metrics.disposable} />
            </div>

            <div className="mt-4">
              <div className="text-sm text-muted-foreground">Save this much each month</div>
              <div className="mt-1 font-display text-6xl text-gradient leading-none">
                ${metrics.monthlyNeeded.toFixed(0)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {metrics.onTrack
                  ? `Within reach — uses ${((metrics.monthlyNeeded / Math.max(1, metrics.disposable)) * 100).toFixed(0)}% of disposable income.`
                  : `Above your current disposable income by $${metrics.gap.toFixed(0)}.`}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat icon={<TrendingUp className="size-3.5" />} label="Savings rate" value={`${metrics.savingsRate.toFixed(0)}%`} />
              <Stat icon={<Target className="size-3.5" />} label="Goal ETA" value={eta} />
              <Stat icon={<Activity className="size-3.5" />} label="Health" value={`${metrics.health}`} suffix="/100" />
            </div>

            <HealthBar score={metrics.health} />

            <div className="mt-6 space-y-2">
              {insights.map((i, idx) => (
                <Insight key={idx} tone={i.tone} text={i.text} />
              ))}
            </div>

            <button className="mt-6 w-full rounded-full bg-primary-gradient text-primary-foreground py-3.5 text-sm font-medium shadow-glow hover:scale-[1.01] transition">
              Build my full plan
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slider({ label, value, min, max, step, format, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  format: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm text-muted-foreground">{label}</label>
        <span className="text-sm font-semibold tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[oklch(0.5_0.18_265)]"
      />
    </div>
  );
}

function Stat({ icon, label, value, suffix }: { icon?: React.ReactNode; label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-border p-3">
      <div className="text-[11px] text-muted-foreground flex items-center gap-1">{icon}{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums">
        {value}{suffix && <span className="text-xs text-muted-foreground font-normal">{suffix}</span>}
      </div>
    </div>
  );
}

function HealthBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const tone = clamped >= 70 ? "Strong" : clamped >= 40 ? "Building" : "Fragile";
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Financial health</span>
        <span className="font-medium text-foreground">{tone}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-primary-gradient transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function StatusPill({ onTrack, disposable }: { onTrack: boolean; disposable: number }) {
  if (disposable <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
        <AlertTriangle className="size-3" /> Rebalance
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${onTrack ? "bg-[oklch(0.95_0.06_165)] text-[oklch(0.35_0.12_165)]" : "bg-[oklch(0.96_0.04_60)] text-[oklch(0.4_0.12_60)]"}`}>
      <CheckCircle2 className="size-3" /> {onTrack ? "On track" : "Stretch goal"}
    </span>
  );
}

function Insight({ tone, text }: { tone: "good" | "warn" | "tip"; text: string }) {
  const Icon = tone === "good" ? CheckCircle2 : tone === "warn" ? AlertTriangle : Lightbulb;
  const color =
    tone === "good" ? "text-[oklch(0.55_0.14_165)]"
    : tone === "warn" ? "text-[oklch(0.6_0.16_60)]"
    : "text-primary";
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-secondary/70 px-3 py-2.5 text-sm animate-fade-up">
      <Icon className={`size-4 mt-0.5 shrink-0 ${color}`} />
      <p className="text-foreground/85 leading-snug">{text}</p>
    </div>
  );
}

function CategoryInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="mt-1 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-background/60 pl-6 pr-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
        />
      </div>
    </label>
  );
}
