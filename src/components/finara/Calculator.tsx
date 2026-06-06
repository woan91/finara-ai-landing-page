import { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, TrendingUp, Target, Activity, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Lightbulb, ChevronDown, ShieldCheck, Plane, Hop as Home, Heart, PiggyBank, ChartLine as LineChart, ArrowRight } from "lucide-react";
import { useI18n } from "./i18n";
import { SavePlanModal } from "./SavePlanModal";
import { registerSnapshotFillCallback, type SnapshotFillData } from "./FinancialSnapshot";

const CATEGORY_KEYS = ["housing", "food", "transport", "shopping", "entertainment", "other"] as const;
type CategoryKey = typeof CATEGORY_KEYS[number];

type CurrencyCode = "USD" | "SGD" | "MYR" | "RMB" | "THB";
const CURRENCIES: Record<CurrencyCode, { symbol: string; rate: number }> = {
  USD: { symbol: "$", rate: 1 },
  SGD: { symbol: "S$", rate: 1.35 },
  MYR: { symbol: "RM", rate: 4.7 },
  RMB: { symbol: "¥", rate: 7.2 },
  THB: { symbol: "฿", rate: 36 },
};
const CURRENCY_ORDER: CurrencyCode[] = ["SGD", "USD", "MYR", "RMB", "THB"];

type PresetKey = "emergency" | "travel" | "house" | "wedding" | "retirement" | "investment";
const PRESETS: { key: PresetKey; icon: typeof ShieldCheck; targetUSD: number; months: number }[] = [
  { key: "emergency",  icon: ShieldCheck, targetUSD: 6000,   months: 12 },
  { key: "travel",     icon: Plane,       targetUSD: 3000,   months: 8  },
  { key: "house",      icon: Home,        targetUSD: 50000,  months: 60 },
  { key: "wedding",    icon: Heart,       targetUSD: 20000,  months: 24 },
  { key: "retirement", icon: PiggyBank,   targetUSD: 100000, months: 120 },
  { key: "investment", icon: LineChart,   targetUSD: 10000,  months: 18 },
];

type PlanMode = "a" | "b"; // a = target date, b = monthly budget

export function Calculator() {
  const { t, lang } = useI18n();
  const [saveOpen, setSaveOpen] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>("SGD");
  const prevCurrency = useRef<CurrencyCode>("SGD");
  const [preset, setPreset] = useState<PresetKey>("travel");
  const [mode, setMode] = useState<PlanMode>("a");

  // Core financial inputs
  const [income, setIncome] = useState(4500);
  const [expenses, setExpenses] = useState(2800);
  const [savings, setSavings] = useState(0);
  const [target, setTarget] = useState(3000);
  const [months, setMonths] = useState(8);
  const [monthlyBudget, setMonthlyBudget] = useState(300);

  // Breakdown
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [categories, setCategories] = useState<Record<CategoryKey, string>>({
    housing: "", food: "", transport: "", shopping: "", entertainment: "", other: "",
  });

  // Auto-fill note visibility
  const [autoFilled, setAutoFilled] = useState(false);

  const cur = CURRENCIES[currency];
  const fmtMoney = useCallback((v: number) => `${cur.symbol}${Math.round(v).toLocaleString()}`, [cur.symbol]);

  // Register to receive snapshot data
  useEffect(() => {
    registerSnapshotFillCallback((data: SnapshotFillData) => {
      // Snapshot uses plain numbers; convert to current currency
      setIncome(Math.round(data.income));
      setExpenses(Math.round(data.expenses));
      setSavings(Math.round(data.savings));
      setAutoFilled(true);
    });
  }, []);

  // When currency changes, convert all monetary values proportionally
  useEffect(() => {
    if (prevCurrency.current === currency) return;
    const from = CURRENCIES[prevCurrency.current].rate;
    const to = cur.rate;
    const ratio = to / from;
    setIncome((v) => Math.round(v * ratio));
    setExpenses((v) => Math.round(v * ratio));
    setSavings((v) => Math.round(v * ratio));
    setTarget((v) => Math.round(v * ratio));
    setMonthlyBudget((v) => Math.round(v * ratio));
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
    setMonthlyBudget(Math.round((p.targetUSD * cur.rate) / p.months));
  };

  const categoryTotal = CATEGORY_KEYS.reduce((sum, k) => sum + (parseFloat(categories[k]) || 0), 0);

  useEffect(() => {
    if (!breakdownOpen) return;
    if (categoryTotal <= 0) return;
    setExpenses(Math.round(Math.min(categoryTotal, income)));
  }, [categoryTotal, breakdownOpen, income]);

  // ── Derived metrics ─────────────────────────────────────────────────────────
  const disposable = Math.max(0, income - expenses);
  const needed = Math.max(0, target - savings);

  // Mode A: user sets target + timeline → compute monthly saving needed
  const monthlyNeeded = mode === "a" ? (months > 0 ? needed / months : needed) : monthlyBudget;
  // Mode B: user sets target + monthly budget → compute estimated months
  const estimatedMonths = mode === "b"
    ? (monthlyBudget > 0 ? Math.ceil(needed / monthlyBudget) : Infinity)
    : months;

  const savingsRate = income > 0 ? (disposable / income) * 100 : 0;
  const feasibility = disposable > 0 ? Math.min(1, disposable / Math.max(1, monthlyNeeded)) : 0;
  const isStretch = monthlyNeeded > disposable && disposable > 0;
  const cannotAfford = disposable <= 0;

  const rateScore = Math.min(100, (savingsRate / 30) * 100);
  const feasibilityScore = feasibility * 100;
  const bufferScore = disposable > monthlyNeeded ? 100 : (disposable / Math.max(1, monthlyNeeded)) * 100;
  const health = Math.round(rateScore * 0.4 + feasibilityScore * 0.4 + bufferScore * 0.2);

  // Suggested realistic months if stretch
  const realisticMonths = disposable > 0 ? Math.ceil(needed / disposable) + 3 : null;

  // ── Insights ────────────────────────────────────────────────────────────────
  const insights: { tone: "good" | "warn" | "tip"; text: string }[] = [];
  const ins = t.calc.insights;
  const rate = Math.round(savingsRate);

  if (savingsRate >= 20) insights.push({ tone: "good", text: ins.rateGood(rate) });
  else if (savingsRate >= 10) insights.push({ tone: "tip", text: ins.rateTip(rate) });
  else insights.push({ tone: "warn", text: ins.rateWarn(rate) });

  if (!isStretch && !cannotAfford) insights.push({ tone: "good", text: ins.targetGood(fmtMoney(monthlyNeeded)) });
  else if (disposable > 0) insights.push({ tone: "warn", text: ins.targetWarn(fmtMoney(Math.max(0, monthlyNeeded - disposable))) });
  else insights.push({ tone: "warn", text: ins.targetRebalance });

  const projectedMonths = disposable > 0 ? needed / disposable : Infinity;
  if (isFinite(projectedMonths) && projectedMonths < months && mode === "a") {
    const m = Math.ceil(projectedMonths);
    insights.push({ tone: "tip", text: ins.faster(m, months - m) });
  } else if (!isFinite(projectedMonths)) {
    insights.push({ tone: "tip", text: ins.starter(fmtMoney(income * 0.05)) });
  } else {
    insights.push({ tone: "tip", text: ins.automate(fmtMoney(monthlyNeeded / 2)) });
  }

  const etaDisplay = mode === "a"
    ? t.calc.months(Math.ceil(projectedMonths > 0 && isFinite(projectedMonths) ? projectedMonths : months))
    : (isFinite(estimatedMonths) ? t.calc.months(estimatedMonths) : "—");

  const incomeMax = Math.round(20000 * cur.rate);
  const incomeStep = Math.max(10, Math.round(100 * cur.rate));
  const targetMax = Math.round(200000 * cur.rate);
  const targetStep = Math.max(50, Math.round(500 * cur.rate));
  const expenseStep = Math.max(10, Math.round(50 * cur.rate));

  const isEn = lang === "en";

  return (
    <section id="calculator" className="relative py-16 sm:py-28 bg-hero">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-12 items-start">
        <div className="lg:sticky lg:top-28">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">{t.calc.eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            {t.calc.titleA}<span className="text-gradient italic">{t.calc.titleB}</span>{t.calc.titleEnd}
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-md">{t.calc.subtitle}</p>

          {autoFilled && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-primary flex items-center gap-2">
              <CheckCircle2 className="size-3.5 shrink-0" />
              {isEn ? "Auto-filled from your Snapshot. Feel free to adjust." : "已从你的财务快照自动填入。你可以随意调整。"}
            </div>
          )}

          <div className="mt-8 space-y-6">
            {/* Goal preset */}
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

            {/* Mode selector */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {isEn ? "How would you like AskFinara to plan for you?" : "你想让 AskFinara 怎样帮你规划？"}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("a")}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium text-left transition ${mode === "a" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card/60 text-muted-foreground hover:text-foreground"}`}
                >
                  <div className="font-semibold mb-0.5">{isEn ? "I want to reach my goal by a date" : "我有目标期限"}</div>
                  <div className="opacity-70">{isEn ? "Tell AskFinara when you want to achieve your goal — e.g. Korea trip in Dec" : "告诉 AskFinara 你希望何时完成目标——例如：12月去韩国"}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("b")}
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium text-left transition ${mode === "b" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card/60 text-muted-foreground hover:text-foreground"}`}
                >
                  <div className="font-semibold mb-0.5">{isEn ? "I have a monthly budget" : "我有月度预算"}</div>
                  <div className="opacity-70">{isEn ? "Tell AskFinara how much you can save monthly, and we'll estimate how long it may take." : "告诉 AskFinara 你每月能存多少，我们来估算大概需要多久。"}</div>
                </button>
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="text-sm text-muted-foreground">{t.calc.currency}</label>
              <div className="mt-2 flex flex-wrap gap-1">
                {CURRENCY_ORDER.map((code) => {
                  const active = currency === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setCurrency(code)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition tabular-nums ${
                        active ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground bg-card/60"
                      }`}
                    >
                      {code}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Income */}
            <Slider label={t.calc.income} value={income} min={Math.round(500 * cur.rate)} max={incomeMax} step={incomeStep} format={fmtMoney} onChange={setIncome} />

            {/* Expenses + breakdown */}
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

            {/* Current savings */}
            <div>
              <div className="flex items-baseline justify-between">
                <label className="text-sm text-muted-foreground">{isEn ? "Current Savings" : "当前储蓄"}</label>
                <span className="text-sm font-semibold tabular-nums">{fmtMoney(savings)}</span>
              </div>
              <input
                type="range" min={0} max={Math.round(100000 * cur.rate)} step={Math.max(50, Math.round(500 * cur.rate))}
                value={Math.min(savings, Math.round(100000 * cur.rate))}
                onChange={(e) => setSavings(Number(e.target.value))}
                className="mt-2 w-full accent-[oklch(0.5_0.18_265)]"
              />
            </div>

            {/* Target */}
            <Slider label={t.calc.target} value={target} min={Math.round(500 * cur.rate)} max={targetMax} step={targetStep} format={fmtMoney} onChange={setTarget} />

            {/* Mode A: timeline slider */}
            {mode === "a" && (
              <Slider label={t.calc.timeline} value={months} min={1} max={120} step={1} format={(v) => t.calc.months(v)} onChange={setMonths} />
            )}

            {/* Mode B: monthly budget slider */}
            {mode === "b" && (
              <div>
                <div className="flex items-baseline justify-between">
                  <label className="text-sm text-muted-foreground">{isEn ? "Monthly saving budget" : "每月储蓄预算"}</label>
                  <span className="text-sm font-semibold tabular-nums">{fmtMoney(monthlyBudget)}</span>
                </div>
                <input
                  type="range" min={Math.round(50 * cur.rate)} max={Math.round(5000 * cur.rate)} step={Math.max(10, Math.round(50 * cur.rate))}
                  value={Math.min(monthlyBudget, Math.round(5000 * cur.rate))}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="mt-2 w-full accent-[oklch(0.5_0.18_265)]"
                />
              </div>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-card/60 p-4 text-sm flex items-center justify-between">
            <span className="text-muted-foreground">{t.calc.disposable}</span>
            <span className="font-semibold">{fmtMoney(disposable)} <span className="text-muted-foreground font-normal">{t.calc.perMo}</span></span>
          </div>
        </div>

        {/* Right panel — Results */}
        <div className="relative">
          <div aria-hidden className="absolute -inset-8 bg-mesh opacity-30 blur-3xl rounded-[3rem]" />
          <div className="relative rounded-3xl bg-card border border-border p-5 sm:p-8 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" /> {t.calc.analysis}
              </div>
              <StatusPill isStretch={isStretch} cannotAfford={cannotAfford} t={t} isEn={isEn} />
            </div>

            {/* Large stat cards */}
            <div className="mt-5 grid grid-cols-1 gap-3">
              {/* Goal card */}
              <div className="rounded-2xl border border-border bg-secondary/50 px-5 py-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {isEn ? "Goal" : "目标"}
                </div>
                <div className="font-display text-2xl font-semibold">
                  {fmtMoney(target)} <span className="text-base font-normal text-muted-foreground">— {t.calc.presets[preset]}</span>
                </div>
              </div>

              {/* Mode A: monthly saving / Mode B: estimated time */}
              {mode === "a" ? (
                <div className={`rounded-2xl border px-5 py-4 ${isStretch ? "border-orange-200 bg-orange-50" : "border-border bg-secondary/50"}`}>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {t.calc.saveEachMonth}
                  </div>
                  <div className={`font-display text-3xl font-semibold ${isStretch ? "text-orange-600" : "text-gradient"}`}>
                    {fmtMoney(monthlyNeeded)}
                    <span className="text-sm font-normal text-muted-foreground ml-1">{t.calc.perMo}</span>
                  </div>
                  {isStretch && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-orange-600">
                      <AlertTriangle className="size-3.5" />
                      {isEn ? "Ambitious Goal" : "目标略具挑战"}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-secondary/50 px-5 py-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {isEn ? "Estimated time needed" : "预计所需时间"}
                  </div>
                  <div className="font-display text-3xl font-semibold text-gradient">
                    {isFinite(estimatedMonths) ? t.calc.months(estimatedMonths) : "—"}
                  </div>
                </div>
              )}

              {/* Secondary: ETA (Mode A) or monthly saving (Mode B) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-secondary/50 px-4 py-3">
                  <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                    <Target className="size-3" /> {isEn ? "Est. time to goal" : "预计达成时间"}
                  </div>
                  <div className="text-lg font-semibold tabular-nums">{etaDisplay}</div>
                </div>
                {mode === "b" && (
                  <div className="rounded-2xl border border-border bg-secondary/50 px-4 py-3">
                    <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                      <TrendingUp className="size-3" /> {t.calc.saveEachMonth}
                    </div>
                    <div className="text-lg font-semibold tabular-nums">{fmtMoney(monthlyBudget)}</div>
                  </div>
                )}
                <div className="rounded-2xl border border-border bg-secondary/50 px-4 py-3">
                  <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
                    <Activity className="size-3" /> {t.calc.health}
                  </div>
                  <div className="text-lg font-semibold tabular-nums">{health}<span className="text-xs text-muted-foreground font-normal">/100</span></div>
                </div>
              </div>
            </div>

            {/* Stretch goal warning */}
            {isStretch && (
              <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5 text-orange-500" />
                  <p>
                    {isEn
                      ? `Your goal looks a little ambitious based on your current disposable income — but don't worry, here are a few realistic ways to make it work 😊`
                      : `根据你目前的可支配收入，这个目标看起来稍微有些挑战——不过别担心，这里有几个切实可行的方法 😊`
                    }
                  </p>
                </div>
                <div className="space-y-1.5 pl-6">
                  <p className="text-xs font-medium text-orange-700">{isEn ? "You can:" : "你可以："}</p>
                  {[
                    isEn ? `Extend your timeline to ~${realisticMonths} months` : `将时间线延长至约 ${realisticMonths} 个月`,
                    isEn ? `Reduce your target amount` : `降低目标金额`,
                    isEn ? `Review your monthly spending` : `重新审视每月支出`,
                  ].map((opt, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <span className="size-1 rounded-full bg-orange-400 shrink-0" />
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <HealthBar score={health} t={t} />

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

function HealthBar({ score, t }: { score: number; t: ReturnType<typeof useI18n>["t"] }) {
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

function StatusPill({ isStretch, cannotAfford, t, isEn }: { isStretch: boolean; cannotAfford: boolean; t: ReturnType<typeof useI18n>["t"]; isEn: boolean }) {
  if (cannotAfford) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
        <AlertTriangle className="size-3" /> {t.calc.rebalance}
      </span>
    );
  }
  if (isStretch) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 px-2.5 py-1 text-[11px] font-medium">
        <AlertTriangle className="size-3" /> {isEn ? "Ambitious Goal" : "目标略具挑战"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.95_0.06_165)] text-[oklch(0.35_0.12_165)] px-2.5 py-1 text-[11px] font-medium">
      <CheckCircle2 className="size-3" /> {t.calc.onTrack}
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
