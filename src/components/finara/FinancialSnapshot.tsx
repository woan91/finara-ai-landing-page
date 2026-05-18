import { useState } from "react";
import { CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Lightbulb, Lock, ChevronDown, TrendingUp, ShieldCheck, Plane, Hop as Home, PiggyBank, ChartLine as LineChart, Sparkles } from "lucide-react";
import { useI18n } from "./i18n";
import { getSupabaseClient } from "@/lib/supabase";

// ─── Types ──────────────────────────────────────────────────────────────────

type GoalKey = "emergency" | "travel" | "house" | "retirement" | "investment";
type RegionKey = "sg" | "my_in_sg" | "my" | "id" | "th" | "other";

interface Inputs {
  age: string;
  income: string;
  expenses: string;
  savings: string;
  goal: GoalKey;
  timeline: string;
}

interface SnapshotResult {
  score: number;
  scoreLabel: string;
  scoreColor: string;
  looks_good: string[];
  needs_attention: string[];
  next_move: string[];
  timeline_msg: string;
  realistic_months: [number, number] | null;
  on_track: boolean;
}

// ─── Score Engine ────────────────────────────────────────────────────────────

function computeSnapshot(inputs: Inputs, lang: "en" | "zh"): SnapshotResult {
  const income = Math.max(1, parseFloat(inputs.income) || 0);
  const expenses = Math.max(0, parseFloat(inputs.expenses) || 0);
  const savings = Math.max(0, parseFloat(inputs.savings) || 0);
  const timeline = Math.max(1, parseInt(inputs.timeline) || 12);
  const age = parseInt(inputs.age) || 25;
  const goal = inputs.goal;

  const disposable = income - expenses;
  const savingsRate = disposable > 0 ? (disposable / income) * 100 : 0;

  // Emergency fund target = 6x monthly expenses
  const efTarget = expenses * 6;
  const efMonths = expenses > 0 ? savings / expenses : 0;

  // Goal targets in same currency (user inputs their own currency)
  const goalTargets: Record<GoalKey, number> = {
    emergency: efTarget,
    travel: income * 3,
    house: income * 24,
    retirement: income * 120,
    investment: income * 10,
  };
  const targetAmount = goalTargets[goal];
  const needed = Math.max(0, targetAmount - savings);
  const monthlyNeeded = timeline > 0 ? needed / timeline : needed;
  const realMonths = disposable > 0 ? needed / disposable : Infinity;

  // ── Scoring (0–100) ──────────────────────────────────────────────────────
  // 1. Savings rate score (0–40)
  const rateScore = Math.min(40, (savingsRate / 25) * 40);

  // 2. Emergency fund coverage score (0–30)
  const efScore = Math.min(30, (Math.min(efMonths, 6) / 6) * 30);

  // 3. Goal realism score (0–30)
  const feasibility = disposable > 0 ? Math.min(1, disposable / Math.max(1, monthlyNeeded)) : 0;
  const goalScore = Math.round(feasibility * 30);

  const score = Math.round(rateScore + efScore + goalScore);

  // ── Score label ──────────────────────────────────────────────────────────
  let scoreLabel: string;
  let scoreColor: string;
  if (score >= 75) {
    scoreLabel = lang === "zh" ? "财务状况强健" : "Strong";
    scoreColor = "oklch(0.55 0.15 165)";
  } else if (score >= 50) {
    scoreLabel = lang === "zh" ? "财务建设中" : "Building";
    scoreColor = "oklch(0.65 0.18 60)";
  } else {
    scoreLabel = lang === "zh" ? "需要关注" : "Needs Attention";
    scoreColor = "oklch(0.6 0.22 25)";
  }

  // ── Insight generation ────────────────────────────────────────────────────
  const looks_good: string[] = [];
  const needs_attention: string[] = [];
  const next_move: string[] = [];

  if (lang === "en") {
    // Looks good
    if (savingsRate >= 20) looks_good.push("Healthy savings habit — you're saving 20%+ of your income");
    else if (savingsRate >= 10) looks_good.push("You've started building a savings habit");
    if (efMonths >= 3) looks_good.push("You have some emergency cushion to fall back on");
    if (disposable > 0) looks_good.push("Your income covers your expenses — a strong foundation");
    if (age < 30) looks_good.push("Starting early gives you a massive compounding advantage");
    if (looks_good.length === 0) looks_good.push("You've taken the first step — awareness is the beginning of change");

    // Needs attention
    if (savingsRate < 10) needs_attention.push("Savings rate is below 10% — small increases will add up fast");
    if (efMonths < 3) needs_attention.push("Emergency fund is below 3 months of expenses — priority to build this up");
    if (disposable <= 0) needs_attention.push("Expenses are exceeding income — review and reduce spending");
    if (monthlyNeeded > disposable * 0.8) needs_attention.push("Goal timeline may be too aggressive given current cash flow");
    if (needs_attention.length === 0) needs_attention.push("Keep monitoring your expense-to-income ratio monthly");

    // Next move
    if (efMonths < 3) next_move.push(`Build emergency fund first — aim for ${Math.ceil(3 - efMonths)} more months of expenses`);
    if (savingsRate < 20 && disposable > 0) next_move.push(`Increase monthly savings by ${Math.round(income * 0.05).toLocaleString()} (5% of income)`);
    if (disposable <= 0) next_move.push("Reduce monthly expenses by at least 10% — start with discretionary spending");
    if (realMonths > timeline * 1.2 && isFinite(realMonths)) next_move.push(`Consider extending your timeline to ${Math.ceil(realMonths)} months for a comfortable pace`);
    if (next_move.length === 0) next_move.push("Automate your savings on payday so it happens before you spend");
  } else {
    // ZH
    if (savingsRate >= 20) looks_good.push("储蓄习惯良好——收入储蓄率达 20% 以上");
    else if (savingsRate >= 10) looks_good.push("已开始建立储蓄习惯，良好的开始");
    if (efMonths >= 3) looks_good.push("你有一定的应急储备，可以应对突发情况");
    if (disposable > 0) looks_good.push("收入覆盖支出——这是坚实的财务基础");
    if (age < 30) looks_good.push("越早开始，复利效果越显著——你的时间是最大优势");
    if (looks_good.length === 0) looks_good.push("你已迈出第一步——自我觉察是改变的起点");

    if (savingsRate < 10) needs_attention.push("储蓄率低于 10%——小幅提升会带来显著积累");
    if (efMonths < 3) needs_attention.push("应急基金不足 3 个月支出——这是优先要建立的");
    if (disposable <= 0) needs_attention.push("支出超过收入——需要审查并减少开支");
    if (monthlyNeeded > disposable * 0.8) needs_attention.push("目标时间线可能过于激进，结合现有现金流来看");
    if (needs_attention.length === 0) needs_attention.push("保持每月监控你的支出收入比");

    if (efMonths < 3) next_move.push(`优先建立应急基金——目标再存 ${Math.ceil(3 - efMonths)} 个月的支出`);
    if (savingsRate < 20 && disposable > 0) next_move.push(`每月多储蓄收入的 5%（约 ${Math.round(income * 0.05).toLocaleString()}）`);
    if (disposable <= 0) next_move.push("将每月支出减少至少 10%——从非必要消费开始");
    if (realMonths > timeline * 1.2 && isFinite(realMonths)) next_move.push(`考虑将目标时间延长至约 ${Math.ceil(realMonths)} 个月，以更舒适的节奏前进`);
    if (next_move.length === 0) next_move.push("在发薪日自动转入储蓄，让储蓄在消费前先发生");
  }

  // ── Timeline reality check ───────────────────────────────────────────────
  let timeline_msg = "";
  let realistic_months: [number, number] | null = null;
  const on_track = disposable >= monthlyNeeded;

  if (disposable <= 0) {
    timeline_msg = lang === "zh"
      ? "目前支出超过收入，在实现任何目标前需先平衡收支。"
      : "Your expenses currently exceed income. Balancing your budget is the first step before any goal is reachable.";
  } else if (on_track) {
    timeline_msg = lang === "zh"
      ? `按照目前的节奏，你有望在 ${timeline} 个月内达成这个目标。`
      : `You are on track to achieve this goal within your ${timeline}-month timeline.`;
  } else if (isFinite(realMonths)) {
    const lo = Math.ceil(realMonths * 0.9);
    const hi = Math.ceil(realMonths * 1.1);
    realistic_months = [lo, hi];
    timeline_msg = lang === "zh"
      ? `以目前的节奏，这个目标现实上需要 ${lo}–${hi} 个月。`
      : `At your current pace, this goal may realistically take ${lo}–${hi} months.`;
  } else {
    timeline_msg = lang === "zh"
      ? "请先调整你的收支，让储蓄成为可能。"
      : "Build a positive monthly savings first to make this goal achievable.";
  }

  return {
    score, scoreLabel, scoreColor,
    looks_good: looks_good.slice(0, 2),
    needs_attention: needs_attention.slice(0, 2),
    next_move: next_move.slice(0, 2),
    timeline_msg, realistic_months, on_track,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="relative h-3 w-full rounded-full bg-secondary overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
        style={{ width: `${score}%`, background: `linear-gradient(90deg, var(--color-primary) 0%, ${color} 100%)` }}
      />
    </div>
  );
}

function InsightCard({
  icon, title, items, tone,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  tone: "good" | "warn" | "tip";
}) {
  const colors = {
    good: { bg: "bg-emerald-50 border-emerald-100", icon: "text-emerald-600", dot: "bg-emerald-500" },
    warn: { bg: "bg-amber-50 border-amber-100", icon: "text-amber-600", dot: "bg-amber-500" },
    tip: { bg: "bg-sky-50 border-sky-100", icon: "text-sky-600", dot: "bg-sky-500" },
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${colors.bg}`}>
      <div className={`flex items-center gap-2 text-sm font-semibold mb-2 ${colors.icon}`}>
        {icon}
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
            <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${colors.dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BlurredCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-[6px] bg-background/60 z-10 rounded-2xl" />
      <p className="text-sm font-semibold mb-2 text-foreground">{title}</p>
      {lines.map((l, i) => (
        <p key={i} className="text-sm text-muted-foreground mb-1">{l}</p>
      ))}
    </div>
  );
}

const GOAL_ICONS: Record<GoalKey, React.ReactNode> = {
  emergency: <ShieldCheck className="size-4" />,
  travel: <Plane className="size-4" />,
  house: <Home className="size-4" />,
  retirement: <PiggyBank className="size-4" />,
  investment: <LineChart className="size-4" />,
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function FinancialSnapshot() {
  const { t, lang } = useI18n();
  const s = t.snapshot;

  const [inputs, setInputs] = useState<Inputs>({
    age: "", income: "", expenses: "", savings: "", goal: "emergency", timeline: "12",
  });
  const [result, setResult] = useState<SnapshotResult | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);

  // Unlock form state
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState<RegionKey>("sg");
  const [faInterest, setFaInterest] = useState<boolean | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockDone, setUnlockDone] = useState(false);

  const isSgUser = region === "sg" || region === "my_in_sg";

  const set = (k: keyof Inputs) => (v: string) => setInputs((p) => ({ ...p, [k]: v }));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = computeSnapshot(inputs, lang);
    setResult(r);
    setShowUnlock(true);
    setTimeout(() => {
      document.getElementById("snapshot-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (unlockLoading || unlockDone) return;
    setUnlockLoading(true);
    try {
      const supabase = getSupabaseClient();
      if (supabase && result) {
        await supabase.from("financial_snapshots").insert({
          email: email.trim().toLowerCase(),
          region,
          age: parseInt(inputs.age) || null,
          monthly_income: parseFloat(inputs.income) || null,
          monthly_expenses: parseFloat(inputs.expenses) || null,
          current_savings: parseFloat(inputs.savings) || null,
          main_goal: inputs.goal,
          timeline_months: parseInt(inputs.timeline) || null,
          health_score: result.score,
          fa_interest: faInterest,
        });
      }
    } catch {
      // best-effort; don't block UX
    } finally {
      setUnlockLoading(false);
      setUnlocked(true);
      setUnlockDone(true);
    }
  }

  async function handleFaChoice(choice: boolean) {
    setFaInterest(choice);
    const supabase = getSupabaseClient();
    if (supabase && email) {
      try {
        await supabase.from("financial_snapshots")
          .update({ fa_interest: choice })
          .eq("email", email.trim().toLowerCase());
      } catch {}
    }
  }

  return (
    <section id="snapshot" className="relative py-16 sm:py-24 bg-hero">
      <div aria-hidden className="pointer-events-none absolute top-0 left-1/3 size-[500px] rounded-full bg-mesh opacity-20 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground mb-5">
            <Sparkles className="size-3.5 text-primary" />
            {s.eyebrow}
          </div>
          <h2 className="font-display text-3xl sm:text-5xl tracking-tight">
            {s.titleA}<span className="text-gradient italic">{s.titleB}</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">{s.subtitle}</p>
        </div>

        {/* Input Form */}
        <div className="rounded-3xl bg-card border border-border shadow-card p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">{s.age}</label>
                <input
                  type="number" min="18" max="70" required
                  value={inputs.age} onChange={(e) => set("age")(e.target.value)}
                  placeholder="28"
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition"
                />
              </div>

              {/* Monthly Income */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">{s.income}</label>
                <input
                  type="number" min="0" required
                  value={inputs.income} onChange={(e) => set("income")(e.target.value)}
                  placeholder="4500"
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition"
                />
              </div>

              {/* Monthly Expenses */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">{s.expenses}</label>
                <input
                  type="number" min="0" required
                  value={inputs.expenses} onChange={(e) => set("expenses")(e.target.value)}
                  placeholder="2800"
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition"
                />
              </div>

              {/* Current Savings */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">{s.currentSavings}</label>
                <input
                  type="number" min="0" required
                  value={inputs.savings} onChange={(e) => set("savings")(e.target.value)}
                  placeholder="8000"
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition"
                />
              </div>

              {/* Main Goal */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">{s.goalLabel}</label>
                <div className="relative">
                  <select
                    value={inputs.goal}
                    onChange={(e) => set("goal")(e.target.value)}
                    className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition appearance-none"
                  >
                    {(["emergency", "travel", "house", "retirement", "investment"] as GoalKey[]).map((g) => (
                      <option key={g} value={g}>{s.goals[g]}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">
                  {s.timelineLabel} <span className="text-primary font-semibold">{inputs.timeline} {s.months}</span>
                </label>
                <input
                  type="range" min="3" max="120" step="1"
                  value={inputs.timeline}
                  onChange={(e) => set("timeline")(e.target.value)}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                  <span>3</span><span>60</span><span>120</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-primary-gradient text-primary-foreground py-4 text-sm font-semibold shadow-glow hover:scale-[1.01] transition-transform"
            >
              {s.cta}
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div id="snapshot-result" className="mt-8 space-y-5 animate-fade-up">
            {/* Score card */}
            <div className="rounded-3xl bg-card border border-border shadow-card p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Sparkles className="size-3.5 text-primary" />
                {s.analysisLabel}
              </div>

              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-0.5">{s.scoreLabel}</div>
                  <div className="font-display text-6xl leading-none" style={{ color: result.scoreColor }}>
                    {result.score}
                  </div>
                  <div className="text-sm font-medium mt-1" style={{ color: result.scoreColor }}>
                    {result.scoreLabel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {GOAL_ICONS[inputs.goal as GoalKey]}
                    {s.goals[inputs.goal as GoalKey]}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{inputs.timeline} {s.months}</div>
                </div>
              </div>

              <ScoreBar score={result.score} color={result.scoreColor} />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>0</span><span>50</span><span>100</span>
              </div>

              {/* Timeline reality check */}
              <div className={`mt-5 rounded-2xl px-4 py-3.5 text-sm border ${result.on_track ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-amber-50 border-amber-100 text-amber-800"}`}>
                <div className="flex items-start gap-2">
                  {result.on_track
                    ? <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                    : <TrendingUp className="size-4 shrink-0 mt-0.5 text-amber-600" />
                  }
                  <span>{result.timeline_msg}</span>
                </div>
              </div>
            </div>

            {/* Three insight cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <InsightCard
                icon={<CheckCircle2 className="size-4" />}
                title={s.looksGood}
                items={result.looks_good}
                tone="good"
              />
              <InsightCard
                icon={<AlertTriangle className="size-4" />}
                title={s.needsAttention}
                items={result.needs_attention}
                tone="warn"
              />
              <InsightCard
                icon={<Lightbulb className="size-4" />}
                title={s.nextMove}
                items={result.next_move}
                tone="tip"
              />
            </div>

            {/* Locked section */}
            {showUnlock && (
              <div className="rounded-3xl bg-card border border-border shadow-card p-6 sm:p-8 animate-fade-up">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex size-9 items-center justify-center rounded-full bg-foreground text-background">
                    <Lock className="size-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-base">{s.unlockTitle}</div>
                    <div className="text-xs text-muted-foreground">{s.unlockSubtitle}</div>
                  </div>
                </div>

                {/* Blurred preview */}
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  <BlurredCard title={s.blurred1Title} lines={s.blurred1Lines} />
                  <BlurredCard title={s.blurred2Title} lines={s.blurred2Lines} />
                </div>

                {unlockDone ? (
                  <div className="animate-fade-up space-y-4">
                    <div className="rounded-2xl bg-secondary p-5 text-center">
                      <div className="text-base font-semibold">{s.comingSoon}</div>
                      <div className="text-sm text-muted-foreground mt-1">{s.comingSoonSub}</div>
                    </div>

                    {/* FA interest — SG only */}
                    {isSgUser && faInterest === null && (
                      <div className="rounded-2xl border border-border p-5 animate-fade-up">
                        <p className="text-sm font-medium mb-3">{s.faPrompt}</p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleFaChoice(true)}
                            className="flex-1 rounded-full border border-primary text-primary text-sm py-2.5 font-medium hover:bg-primary hover:text-primary-foreground transition"
                          >
                            {s.faYes}
                          </button>
                          <button
                            onClick={() => handleFaChoice(false)}
                            className="flex-1 rounded-full border border-border text-muted-foreground text-sm py-2.5 font-medium hover:bg-secondary transition"
                          >
                            {s.faNo}
                          </button>
                        </div>
                      </div>
                    )}

                    {faInterest === true && (
                      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-800">
                        {s.faThanks}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleUnlock} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground/80">{s.emailLabel}</label>
                        <input
                          type="email" required
                          value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@email.com"
                          className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5 text-foreground/80">{s.regionLabel}</label>
                        <div className="relative">
                          <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value as RegionKey)}
                            className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition appearance-none"
                          >
                            {(Object.keys(s.regions) as RegionKey[]).map((r) => (
                              <option key={r} value={r}>{s.regions[r]}</option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={unlockLoading}
                      className="w-full rounded-full bg-primary-gradient text-primary-foreground py-3.5 text-sm font-semibold shadow-glow hover:scale-[1.01] transition-transform disabled:opacity-70"
                    >
                      {unlockLoading ? s.unlocking : s.unlockCta}
                    </button>
                    <p className="text-center text-xs text-muted-foreground">{s.privacyNote}</p>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
