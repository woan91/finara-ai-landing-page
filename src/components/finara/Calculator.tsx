import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

export function Calculator() {
  const [goal, setGoal] = useState(5000);
  const [months, setMonths] = useState(12);
  const [start, setStart] = useState(500);

  const monthly = useMemo(() => Math.max(0, (goal - start) / months), [goal, months, start]);
  const weekly = monthly / 4.33;
  const daily = monthly / 30;

  return (
    <section id="calculator" className="relative py-28 bg-hero">
      <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">AI Goal Planner</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight">
            Try the <span className="text-gradient italic">savings preview</span>.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-md">
            Set a goal. Finara breaks it into a plan you can actually live with — adjusted to your real cash flow.
          </p>

          <div className="mt-8 space-y-6">
            <Slider label="Goal amount" value={goal} min={500} max={50000} step={100} format={(v) => `$${v.toLocaleString()}`} onChange={setGoal} />
            <Slider label="Timeline" value={months} min={1} max={60} step={1} format={(v) => `${v} months`} onChange={setMonths} />
            <Slider label="Already saved" value={start} min={0} max={goal} step={50} format={(v) => `$${v.toLocaleString()}`} onChange={setStart} />
          </div>
        </div>

        <div className="relative">
          <div aria-hidden className="absolute -inset-8 bg-mesh opacity-30 blur-3xl rounded-[3rem]" />
          <div className="relative rounded-3xl bg-card border border-border p-8 shadow-card">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" /> Finara AI suggests
            </div>
            <div className="mt-3">
              <div className="text-sm text-muted-foreground">Save this much each month</div>
              <div className="mt-1 font-display text-6xl text-gradient">${monthly.toFixed(0)}</div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat label="Per week" value={`$${weekly.toFixed(2)}`} />
              <Stat label="Per day" value={`$${daily.toFixed(2)}`} />
            </div>
            <div className="mt-6 rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Tip · </span>
              Automate ${(monthly / 2).toFixed(0)} on payday and ${(monthly / 2).toFixed(0)} mid-month — it feels lighter and stays consistent.
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
        <span className="text-sm font-semibold">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[oklch(0.5_0.18_265)]"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
