import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles, TrendingUp, Target, Activity, CheckCircle2, AlertTriangle, Lightbulb, ChevronDown,
  ShieldCheck, Plane, Home, Heart, PiggyBank, LineChart,
} from "lucide-react";
import { useI18n } from "./i18n";
import { SavePlanModal } from "./SavePlanModal";

const CATEGORY_KEYS = ["housing", "food", "transport", "shopping", "entertainment", "other"] as const;
type CategoryKey = typeof CATEGORY_KEYS[number];

type CurrencyCode = "USD" | "SGD" | "MYR" | "RMB" | "THB";
// Conversion factor relative to USD (1 USD = N units)
const CURRENCIES: Record<CurrencyCode, { symbol: string; rate: number }> = {
  USD: { symbol: "$", rate: 1 },
  SGD: { symbol: "S$", rate: 1.35 },
  MYR: { symbol: "RM", rate: 4.7 },
  RMB: { symbol: "¥", rate: 7.2 },
  THB: { symbol: "฿", rate: 36 },
};
const CURRENCY_ORDER: CurrencyCode[] = ["SGD", "USD", "MYR", "RMB", "THB"];

type PresetKey = "emergency" | "travel" | "house" | "wedding" | "retirement" | "investment";
// Targets are in USD base; converted at runtime
const PRESETS: { key: PresetKey; icon: typeof ShieldCheck; targetUSD: number; months: number }[] = [
  { key: "emergency",  icon: ShieldCheck, targetUSD: 6000,   months: 12 },
  { key: "travel",     icon: Plane,       targetUSD: 3000,   months: 8  },
  { key: "house",      icon: Home,        targetUSD: 50000,  months: 60 },
  { key: "wedding",    icon: Heart,       targetUSD: 20000,  months: 24 },
  { key: "retirement", icon: PiggyBank,   targetUSD: 100000, months: 120 },
  { key: "investment", icon: LineChart,   targetUSD: 10000,  months: 18 },
];

export function Calculator() {
  const { t } = useI18n();
  const [saveOpen, setSaveOpen] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const prevCurrency = useRef<CurrencyCode>("USD");
  const [preset, setPreset] = useState<PresetKey>("travel");

  const [income, setIncome] = useState(3500);
  const [expenses, setExpenses] = useState(2200);
  const [target, setTarget] = useState(3000);
  const [months, setMonths] = useState(8);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [categories, setCategories] = useState<Record<CategoryKey, string>>({
    housing: "", food: "", transport: "", shopping: "", entertainment: "", other: "",
  });

  const cur = CURRENCIES[currency];
  const fmtMoney = (v: number) => `${cur.symbol}${Math.round(v).toLocaleString()}`;

  // When currency changes, convert all monetary values proportionally
  useEffect(() => {
    if (prevCurrency.current === currency) return;
    const from = CURRENCIES[prevCurrency.current].rate;
    const to = cur.rate;
    const ratio = to / from;
    setIncome((v) => Math.round(v * ratio));
    setExpenses((v) => Math.round(v * ratio));
    setTarget((v) => Math.round(v * ratio));
    setCategories((c) => {
      const next = { ...c };
      for (const k of CATEGORY_KEYS) {
        const n = parseFloat(next[k]);
        if (!isNaN(n) && n > 0) next[k] = String(Math.round(n * ratio));
      }
      return next;
    });
    prevCurrency.current = currency;
  }, [currency, cur.rate]);

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    const p = PRESETS.find((x) => x.key === key)!;
    setTarget(Math.round(p.targetUSD * cur.rate));
    setMonths(p.months);
  };

  const categoryTotal = useMemo(
    () => CATEGORY_KEYS.reduce((sum, k) => sum + (parseFloat(categories[k]) || 0), 0),
    [categories]
  );

  useEffect(() => {
    if (!breakdownOpen) return;
    if (categoryTotal <= 0) return;
    const total = Math.min(categoryTotal, income);
    setExpenses(Math.round(total));
  }, [categoryTotal, breakdownOpen, income]);

  // Dynamic slider bounds scaled by currency
  const incomeMax = Math.round(20000 * cur.rate);
  const incomeStep = Math.max(10, Math.round(100 * cur.rate));
  const targetMax = Math.round(200000 * cur.rate);
  const targetStep = Math.max(50, Math.round(500 * cur.rate));
  const expenseStep = Math.max(10, Math.round(50 * cur.rate));

  const metrics = useMemo(() => {
    const disposable = Math.max(0, income - expenses);
    const monthlyNeeded = target / Math.max(1, months);
    const savingsRate = income > 0 ? (disposable / income) * 100 : 0;
    const feasibility = disposable > 0 ? Math.min(1, disposable / monthlyNeeded) : 0;
    const projectedMonths = disposable > 0 ? target / disposable : Infinity;

    const rateScore = Math.min(100, (savingsRate / 30) * 100);
    const feasibilityScore = feasibility * 100;
    const bufferScore = disposable > monthlyNeeded ? 100 : (disposable / Math.max(1, monthlyNeeded)) * 100;
    const health = Math.round(rateScore * 0.4 + feasibilityScore * 0.4 + bufferScore * 0.2);

    const onTrack = disposable >= monthlyNeeded;
    const gap = Math.max(0, monthlyNeeded - disposable);

    return { disposable, monthlyNeeded, savingsRate, feasibility, projectedMonths, health, onTrack, gap };
  }, [income, expenses, target, months]);

  const insights = useMemo(() => {
    const list: { tone: "good" | "warn" | "tip"; text: string }[] = [];
    const ins = t.calc.insights;
    const rate = Math.round(metrics.savingsRate);

    if (metrics.savingsRate >= 20) list.push({ tone: "good", text: ins.rateGood(rate) });
    else if (metrics.savingsRate >= 10) list.push({ tone: "tip", text: ins.rateTip(rate) });
    else list.push({ tone: "warn", text: ins.rateWarn(rate) });

    if (metrics.onTrack) list.push({ tone: "good", text: ins.targetGood(fmtMoney(metrics.monthlyNeeded)) });
    else if (metrics.disposable > 0) list.push({ tone: "warn", text: ins.targetWarn(fmtMoney(metrics.gap)) });
    else list.push({ tone: "warn", text: ins.targetRebalance });

    if (isFinite(metrics.projectedMonths) && metrics.projectedMonths < months) {
      const m = Math.ceil(metrics.projectedMonths);
      list.push({ tone: "tip", text: ins.faster(m, months - m) });
    } else if (!isFinite(metrics.projectedMonths)) {
      list.push({ tone: "tip", text: ins.starter(fmtMoney(income * 0.05)) });
    } else {
      list.push({ tone: "tip", text: ins.automate(fmtMoney(metrics.monthlyNeeded / 2)) });
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metrics, months, income, t, currency]);

  const eta = isFinite(metrics.projectedMonths) ? t.calc.months(Math.ceil(metrics.projectedMonths)) : "—";

  return (
    <section id="calculator" className="relative py-28 bg-hero">
      <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-12 items-start">
        <div className="lg:sticky lg:top-28">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">{t.calc.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl tracking-tight">
            {t.calc.titleA}<span className="text-gradient italic">{t.calc.titleB}</span>{t.calc.titleEnd}
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-md">{t.calc.subtitle}</p>

          <div className="mt-8 space-y-6">
            {/* Goal preset selector */}
            <div>
              <div className="flex items-baseline justify-between">
                <label className="text-sm text-muted-foreground">{t.calc.goal}</label>
                <span className="text-[11px] text-muted-foreground">{t.calc.presetHint}</span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {PRESETS.map((p) => {
                  const Icon = p.icon;
                  const active = preset === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => applyPreset(p.key)}
                      className={`group flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-[11px] font-medium transition ${
                        active
                          ? "border-transparent bg-primary-gradient text-primary-foreground shadow-glow"
                          : "border-border bg-card/60 text-foreground/80 hover:border-foreground/20 hover:bg-card"
                      }`}
                    >
                      <Icon className={`size-4 ${active ? "" : "text-primary"}`} />
                      <span className="leading-tight text-center">{t.calc.presets[p.key]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currency selector */}
            <div>
              <label className="text-sm text-muted-foreground">{t.calc.currency}</label>
              <div className="mt-2 inline-flex rounded-full border border-border bg-card/60 p-1">
                {CURRENCY_ORDER.map((code) => {
                  const active = currency === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setCurrency(code)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition tabular-nums ${
                        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {code}
                    </button>
                  );
                })}
              </div>
            </div>

            <Slider label={t.calc.income} value={income} min={Math.round(500 * cur.rate)} max={incomeMax} step={incomeStep} format={fmtMoney} onChange={setIncome} />
            <div>
              <Slider
                label={t.calc.expenses}
                value={expenses}
                min={0}
                max={Math.max(income, 1)}
                step={expenseStep}
                format={fmtMoney}
                onChange={(v) => { if (breakdownOpen) return; setExpenses(Math.min(v, income)); }}
              />
              <button
                type="button"
                onClick={() => setBreakdownOpen((o) => !o)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
                aria-expanded={breakdownOpen}
              >
                <ChevronDown className={`size-3.5 transition-transform ${breakdownOpen ? "rotate-180" : ""}`} />
                {breakdownOpen ? t.calc.hideBreakdown : t.calc.breakDown}
              </button>

              {breakdownOpen && (
                <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4 animate-fade-up">
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORY_KEYS.map((key) => (
                      <CategoryInput
                        key={key}
                        label={t.calc.categories[key]}
                        symbol={cur.symbol}
                        value={categories[key]}
                        onChange={(v) => setCategories((c) => ({ ...c, [key]: v }))}
                      />
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t.calc.totalCategories}</span>
                    <span className="font-semibold tabular-nums">{fmtMoney(categoryTotal)} <span className="text-muted-foreground font-normal">{t.calc.perMo}</span></span>
                  </div>
                </div>
              )}
            </div>
            <Slider label={t.calc.target} value={target} min={Math.round(500 * cur.rate)} max={targetMax} step={targetStep} format={fmtMoney} onChange={setTarget} />
            <Slider label={t.calc.timeline} value={months} min={1} max={120} step={1} format={(v) => t.calc.months(v)} onChange={setMonths} />
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card/60 p-4 text-sm flex items-center justify-between">
            <span className="text-muted-foreground">{t.calc.disposable}</span>
            <span className="font-semibold">{fmtMoney(metrics.disposable)} <span className="text-muted-foreground font-normal">{t.calc.perMo}</span></span>
          </div>
        </div>

        <div className="relative">
          <div aria-hidden className="absolute -inset-8 bg-mesh opacity-30 blur-3xl rounded-[3rem]" />
          <div className="relative rounded-3xl bg-card border border-border p-8 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" /> {t.calc.analysis}
              </div>
              <StatusPill onTrack={metrics.onTrack} disposable={metrics.disposable} />
            </div>

            <div className="mt-4">
              <div className="text-sm text-muted-foreground">{t.calc.saveEachMonth}</div>
              <div className="mt-1 font-display text-6xl text-gradient leading-none">
                {fmtMoney(metrics.monthlyNeeded)}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {metrics.onTrack
                  ? t.calc.withinReach(Math.round((metrics.monthlyNeeded / Math.max(1, metrics.disposable)) * 100))
                  : t.calc.aboveDisposable(fmtMoney(metrics.gap))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat icon={<TrendingUp className="size-3.5" />} label={t.calc.savingsRate} value={`${metrics.savingsRate.toFixed(0)}%`} />
              <Stat icon={<Target className="size-3.5" />} label={t.calc.eta} value={eta} />
              <Stat icon={<Activity className="size-3.5" />} label={t.calc.health} value={`${metrics.health}`} suffix="/100" />
            </div>

            <HealthBar score={metrics.health} />

            <div className="mt-6 space-y-2">
              {insights.map((i, idx) => (
                <Insight key={idx} tone={i.tone} text={i.text} />
              ))}
            </div>

            <div className="mt-6 grid gap-2">
              <button
                type="button"
                onClick={() => setSaveOpen(true)}
                className="w-full rounded-full bg-primary-gradient text-primary-foreground py-3.5 text-sm font-medium shadow-glow hover:scale-[1.01] transition"
              >
                {t.calc.save}
              </button>
              <button
                type="button"
                className="w-full rounded-full border border-border bg-background/60 hover:bg-secondary text-foreground py-3 text-sm font-medium transition"
              >
                {t.calc.buildPlan}
              </button>
            </div>
          </div>
        </div>
      </div>
      <SavePlanModal open={saveOpen} onClose={() => setSaveOpen(false)} />
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
        type="range" min={min} max={max} step={step} value={Math.min(Math.max(value, min), max)}
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
  const { t } = useI18n();
  const clamped = Math.max(0, Math.min(100, score));
  const tone = clamped >= 70 ? t.calc.healthStrong : clamped >= 40 ? t.calc.healthBuilding : t.calc.healthFragile;
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t.calc.healthLabel}</span>
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
  const { t } = useI18n();
  if (disposable <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
        <AlertTriangle className="size-3" /> {t.calc.rebalance}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${onTrack ? "bg-[oklch(0.95_0.06_165)] text-[oklch(0.35_0.12_165)]" : "bg-[oklch(0.96_0.04_60)] text-[oklch(0.4_0.12_60)]"}`}>
      <CheckCircle2 className="size-3" /> {onTrack ? t.calc.onTrack : t.calc.stretch}
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

function CategoryInput({ label, symbol, value, onChange }: { label: string; symbol: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="mt-1 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{symbol}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-background/60 pl-8 pr-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/40 transition"
        />
      </div>
    </label>
  );
}
