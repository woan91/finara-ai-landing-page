import { useState } from "react";
import { CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Lightbulb, Lock, ChevronDown, TrendingUp, ShieldCheck, Plane, Hop as Home, PiggyBank, ChartLine as LineChart, Sparkles, Target, Star } from "lucide-react";
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
  scoreInterpretation: string;
  looks_good: string[];
  needs_attention: string[];
  next_move: string[];
  timeline_msg: string;
  realistic_months: [number, number] | null;
  on_track: boolean;
  reassurance: string;
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

  // ── Score label & interpretation ─────────────────────────────────────────
  let scoreLabel: string;
  let scoreColor: string;
  let scoreInterpretation: string;
  if (score >= 90) {
    scoreLabel = lang === "zh" ? "卓越" : "Excellent";
    scoreColor = "oklch(0.48 0.17 165)";
    scoreInterpretation = lang === "zh"
      ? "出色——你正在建立强劲的财务动力。"
      : "Excellent — you're building strong financial momentum.";
  } else if (score >= 75) {
    scoreLabel = lang === "zh" ? "稳健" : "Strong";
    scoreColor = "oklch(0.55 0.15 165)";
    scoreInterpretation = lang === "zh"
      ? "你走在一条稳健的道路上，还有一些可以优化的空间。"
      : "You're on a solid path with a few opportunities to improve.";
  } else if (score >= 60) {
    scoreLabel = lang === "zh" ? "尚可" : "Okay";
    scoreColor = "oklch(0.58 0.17 60)";
    scoreInterpretation = lang === "zh"
      ? "你做得还不错，但有一些值得关注的财务盲点。"
      : "You're doing okay, but there are some financial blind spots worth fixing.";
  } else if (score >= 40) {
    scoreLabel = lang === "zh" ? "建设中" : "Building";
    scoreColor = "oklch(0.65 0.18 60)";
    scoreInterpretation = lang === "zh"
      ? "你的财务状况或许比它应有的更让人感到压力。"
      : "Your finances may feel more stressful than they need to be.";
  } else {
    scoreLabel = lang === "zh" ? "需要关注" : "Needs Attention";
    scoreColor = "oklch(0.6 0.22 25)";
    scoreInterpretation = lang === "zh"
      ? "一旦发生意外，你的财务缓冲可能不够充足。"
      : "You may be financially vulnerable if something unexpected happens.";
  }

  // ── Insight generation ────────────────────────────────────────────────────
  const looks_good: string[] = [];
  const needs_attention: string[] = [];
  const next_move: string[] = [];

  const savingsRateRounded = Math.round(savingsRate);
  const efDays = Math.round(efMonths * 30);
  const fivePct = Math.round(income * 0.05);

  if (lang === "en") {
    // What You're Doing Well
    if (savingsRate >= 20) {
      looks_good.push(`You're saving ${savingsRateRounded}% of your income — that consistency gives you a real long-term advantage.`);
    } else if (savingsRate >= 10) {
      looks_good.push(`You're saving ${savingsRateRounded}% of your income — a meaningful start that can grow with small nudges.`);
    }
    if (efMonths >= 3) {
      looks_good.push(`Your savings can cover about ${Math.round(efMonths)} months of expenses — that's a genuine safety cushion.`);
    }
    if (disposable > 0 && savingsRate < 10) {
      looks_good.push("Your spending appears controlled compared to your income, which creates room for future flexibility.");
    }
    if (age < 30) {
      looks_good.push("Starting before 30 gives you a compounding advantage most people wish they had — time is your most valuable asset.");
    }
    if (looks_good.length === 0) {
      looks_good.push("You've taken the first step — most people never even look at their numbers. Awareness is where change begins.");
    }

    // Financial Blind Spot
    if (efMonths < 1) {
      needs_attention.push(`If your income stopped today, your savings may only support around ${efDays} days of expenses.`);
    } else if (efMonths < 3) {
      needs_attention.push(`Your current savings cover about ${Math.round(efMonths * 30)} days of expenses — building a 3-month buffer would significantly reduce your financial risk.`);
    }
    if (disposable <= 0) {
      needs_attention.push("You may be relying too heavily on future income rather than building financial breathing room.");
    } else if (monthlyNeeded > disposable * 0.8) {
      needs_attention.push("Your goal timeline may feel tight — pushing too hard can make saving feel like a burden rather than a habit.");
    }
    if (savingsRate < 10 && disposable > 0) {
      needs_attention.push("A small shift in where your money goes each month could have a surprisingly large impact over time.");
    }
    if (needs_attention.length === 0) {
      needs_attention.push("Keep monitoring your expense-to-income ratio monthly — small drifts compound quickly over time.");
    }

    // Smart Next Step
    if (efMonths < 3 && disposable > 0) {
      next_move.push(`If you increase savings by just $${fivePct.toLocaleString()}/month, your emergency fund could be fully built in ${Math.ceil((expenses * 3 - savings) / fivePct)} months.`);
    }
    if (savingsRate < 20 && disposable > 0 && efMonths >= 3) {
      next_move.push(`A small reduction in discretionary spending of around $${fivePct.toLocaleString()}/month could speed up your goal more than you expect.`);
    }
    if (disposable <= 0) {
      next_move.push("Start by identifying one recurring expense to reduce — even a 5–10% cut in spending can restore positive cash flow.");
    }
    if (realMonths > timeline * 1.2 && isFinite(realMonths)) {
      next_move.push(`Reaching this goal in ${timeline} months may feel stressful. A timeline closer to ${Math.ceil(realMonths) + 3} months could feel much healthier.`);
    }
    if (next_move.length === 0) {
      next_move.push("Automate your savings on payday — when it happens before you spend, it stops feeling like sacrifice.");
    }
  } else {
    // ZH — What You're Doing Well
    if (savingsRate >= 20) {
      looks_good.push(`你储蓄了收入的 ${savingsRateRounded}%——这种一致性让你拥有真正的长期优势。`);
    } else if (savingsRate >= 10) {
      looks_good.push(`你的储蓄率为 ${savingsRateRounded}%——有意义的开始，通过小幅调整还能进一步提升。`);
    }
    if (efMonths >= 3) {
      looks_good.push(`你的储蓄可以支撑约 ${Math.round(efMonths)} 个月的开支——这是一个真实的安全缓冲。`);
    }
    if (disposable > 0 && savingsRate < 10) {
      looks_good.push("与收入相比，你的支出相对可控，这为未来的灵活性创造了空间。");
    }
    if (age < 30) {
      looks_good.push("在 30 岁前起步，让你拥有大多数人梦寐以求的复利优势——时间是你最宝贵的资产。");
    }
    if (looks_good.length === 0) {
      looks_good.push("你已迈出第一步——大多数人从不正视自己的财务数字。觉察是改变的开始。");
    }

    // ZH — Financial Blind Spot
    if (efMonths < 1) {
      needs_attention.push(`如果你的收入今天停止，你的储蓄可能只能支撑约 ${efDays} 天的生活支出。`);
    } else if (efMonths < 3) {
      needs_attention.push(`你目前的储蓄约能维持 ${Math.round(efMonths * 30)} 天——建立 3 个月的应急缓冲将显著降低你的财务风险。`);
    }
    if (disposable <= 0) {
      needs_attention.push("你可能过度依赖未来的收入，而没有构建足够的财务喘息空间。");
    } else if (monthlyNeeded > disposable * 0.8) {
      needs_attention.push("你的目标时间线可能感觉很紧——用力过猛会让储蓄变成负担而非习惯。");
    }
    if (savingsRate < 10 && disposable > 0) {
      needs_attention.push("每月资金流向的微小调整，随着时间推移可能产生出乎意料的巨大影响。");
    }
    if (needs_attention.length === 0) {
      needs_attention.push("坚持每月监控你的收支比——微小的漂移随时间会快速复利积累。");
    }

    // ZH — Smart Next Step
    if (efMonths < 3 && disposable > 0) {
      next_move.push(`每月多储蓄 ${fivePct.toLocaleString()} 元，你的应急基金可在约 ${Math.ceil((expenses * 3 - savings) / fivePct)} 个月内建立完成。`);
    }
    if (savingsRate < 20 && disposable > 0 && efMonths >= 3) {
      next_move.push(`每月削减约 ${fivePct.toLocaleString()} 元的非必要支出，对目标进度的加速效果会超出你的预期。`);
    }
    if (disposable <= 0) {
      needs_attention.push("从识别一项可减少的固定支出开始——即使减少 5–10%，也能恢复正向现金流。");
    }
    if (realMonths > timeline * 1.2 && isFinite(realMonths)) {
      next_move.push(`在 ${timeline} 个月内实现这个目标可能会感到有压力。将时间线调整到约 ${Math.ceil(realMonths) + 3} 个月，节奏会舒适许多。`);
    }
    if (next_move.length === 0) {
      next_move.push("在发薪日自动转入储蓄——当储蓄在消费前先发生，它就不再感觉像是牺牲。");
    }
  }

  // ── Timeline reality check ───────────────────────────────────────────────
  let timeline_msg = "";
  let realistic_months: [number, number] | null = null;
  const on_track = disposable >= monthlyNeeded;

  if (disposable <= 0) {
    timeline_msg = lang === "zh"
      ? "目前支出超过收入。先平衡收支，目标自然会变得触手可及。"
      : "Your expenses currently exceed income. Balancing your budget is the first step — once that's done, goals become reachable.";
  } else if (on_track) {
    timeline_msg = lang === "zh"
      ? `你出乎意料地走在正轨上——一致性比完美更重要。`
      : "You're surprisingly on track — consistency matters more than perfection.";
  } else if (isFinite(realMonths)) {
    const lo = Math.ceil(realMonths);
    const hi = lo + 3;
    realistic_months = [lo, hi];
    timeline_msg = lang === "zh"
      ? `在 ${timeline} 个月内实现这个目标可能会感到吃力。将时间线调整到 ${hi} 个月，节奏会健康得多。`
      : `Reaching this goal in ${timeline} months may feel stressful. A timeline closer to ${hi} months could feel much healthier.`;
  } else {
    timeline_msg = lang === "zh"
      ? "先建立正向的月度储蓄，这个目标就会变得清晰可见。"
      : "Build a positive monthly savings habit first — once you do, this goal will feel much more within reach.";
  }

  // ── Reassurance line ─────────────────────────────────────────────────────
  const reassurances = lang === "zh"
    ? ["你不需要完美的财务——只需要一个更好的计划。", "今天的小改变，能让未来感觉轻盈许多。", "你可能比自己想象的做得更好——现在让我们一起优化它。"]
    : ["You don't need perfect finances — just a better plan.", "Small changes today can make your future feel much lighter.", "You're probably doing better than you think — now let's improve it."];
  const reassurance = reassurances[score % 3];

  return {
    score, scoreLabel, scoreColor, scoreInterpretation,
    looks_good: looks_good.slice(0, 2),
    needs_attention: needs_attention.slice(0, 2),
    next_move: next_move.slice(0, 2),
    timeline_msg, realistic_months, on_track, reassurance,
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
    <div className={`rounded-xl border p-3 ${colors.bg}`}>
      <div className={`flex items-center gap-1.5 text-xs font-semibold mb-2 ${colors.icon}`}>
        {icon}
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80 leading-snug">
            <span className={`mt-1.5 size-1 rounded-full shrink-0 ${colors.dot}`} />
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

// ─── Action Plan Engine ───────────────────────────────────────────────────────

interface ActionPoint {
  icon: React.ReactNode;
  title: string;
  body: string;
}

const GOAL_AMOUNTS: Record<GoalKey, (income: number, expenses: number) => number> = {
  emergency: (_i, e) => e * 3,
  travel: (i) => i * 3,
  house: (i) => i * 24,
  retirement: (i) => i * 120,
  investment: (i) => i * 10,
};

function buildActionPlan(inputs: Inputs, lang: "en" | "zh"): ActionPoint[] {
  const income = Math.max(1, parseFloat(inputs.income) || 0);
  const expenses = Math.max(0, parseFloat(inputs.expenses) || 0);
  const savings = Math.max(0, parseFloat(inputs.savings) || 0);
  const timeline = Math.max(1, parseInt(inputs.timeline) || 12);
  const age = parseInt(inputs.age) || 25;
  const goal = inputs.goal;

  const surplus = income - expenses;
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  const efMonths = expenses > 0 ? savings / expenses : 0;
  const goalAmt = GOAL_AMOUNTS[goal](income, expenses);
  const monthsNeeded = surplus > 0 ? Math.ceil(goalAmt / surplus) : Infinity;
  const fmt = (n: number) => Math.round(n).toLocaleString();

  const isEn = lang === "en";

  // Point 1 — Emergency Fund
  let efTitle: string;
  let efBody: string;
  if (efMonths < 3) {
    efTitle = isEn ? "Build Your Emergency Fund" : "建立紧急备用金";
    efBody = isEn
      ? `Your emergency fund needs attention. Based on your $${fmt(expenses)}/month spending, aim for $${fmt(expenses * 3)} as your safety net. You currently have ${efMonths.toFixed(1)} months covered.`
      : `你的紧急备用金还需要加强。以你目前每月 $${fmt(expenses)} 的支出，建议目标是 $${fmt(expenses * 3)}。目前你有 ${efMonths.toFixed(1)} 个月的保障。`;
  } else {
    efTitle = isEn ? "Emergency Fund: Solid" : "紧急备用金：稳健";
    efBody = isEn
      ? `Your emergency fund is solid at ${efMonths.toFixed(1)} months of coverage. You're ahead of most people your age.`
      : `你的紧急备用金很稳健，已覆盖 ${efMonths.toFixed(1)} 个月支出，比同龄人做得好。`;
  }

  // Point 2 — Savings Rate
  let srTitle: string;
  let srBody: string;
  if (savingsRate < 20) {
    srTitle = isEn ? "Grow Your Savings Rate" : "提升储蓄率";
    srBody = isEn
      ? `Your current savings rate of ${savingsRate}% has room to grow. Even increasing by 5% monthly could make a significant difference over time.`
      : `你目前 ${savingsRate}% 的储蓄率还有提升空间。每月多储蓄 5%，长期影响会很大。`;
  } else if (savingsRate < 40) {
    srTitle = isEn ? "Savings Rate: Healthy" : "储蓄率：良好";
    srBody = isEn
      ? `Saving ${savingsRate}% of your income puts you in a healthy position. Consistency is your biggest advantage now.`
      : `储蓄 ${savingsRate}% 的收入是很好的习惯，坚持下去就是你最大的优势。`;
  } else {
    srTitle = isEn ? "Savings Rate: Impressive" : "储蓄率：卓越";
    srBody = isEn
      ? `Saving ${savingsRate}% of your income is impressive. You're building serious long-term wealth.`
      : `储蓄 ${savingsRate}% 的收入非常出色，你正在为未来打下坚实基础。`;
  }

  // Point 3 — Goal Timeline
  const goalLabel = isEn
    ? { emergency: "Emergency Fund", travel: "Travel", house: "House / Property", retirement: "Retirement", investment: "Investment" }[goal]
    : { emergency: "应急基金", travel: "旅行", house: "购房", retirement: "退休", investment: "投资" }[goal];

  let gtTitle: string;
  let gtBody: string;
  if (isFinite(monthsNeeded) && timeline < monthsNeeded * 0.8) {
    gtTitle = isEn ? "Adjust Your Timeline" : "调整你的时间目标";
    gtBody = isEn
      ? `Your ${timeline}-month timeline for ${goalLabel} is ambitious. A more comfortable pace would be around ${monthsNeeded} months. Steady progress beats rushing.`
      : `你 ${timeline} 个月的${goalLabel}目标有些激进。更舒适的节奏大约是 ${monthsNeeded} 个月，稳步前进比冲刺更有效。`;
  } else {
    gtTitle = isEn ? "Timeline: On Track" : "时间规划：进度良好";
    gtBody = isEn
      ? `Your timeline looks realistic. At your current pace, ${goalLabel} is achievable within ${timeline} months.`
      : `你的时间规划很合理，按目前进度，${goalLabel}目标在 ${timeline} 个月内是可以实现的。`;
  }

  // Point 4 — Age Insight
  let ageTitle: string;
  let ageBody: string;
  if (age < 30) {
    ageTitle = isEn ? "Time Is Your Superpower" : "时间是你的超能力";
    ageBody = isEn
      ? "Starting your financial journey before 30 gives you a powerful compounding advantage. Time is your most valuable financial asset right now."
      : "30 岁前开始规划财务，复利效应会是你最强大的武器。时间就是你现在最宝贵的资产。";
  } else if (age < 45) {
    ageTitle = isEn ? "Prime Wealth-Building Years" : "财富积累黄金期";
    ageBody = isEn
      ? "Your 30s and 40s are prime wealth-building years. Focus on consistent savings and eliminating high-interest debt."
      : "30 至 45 岁是财富积累的黄金期，专注于稳定储蓄和减少高息负债。";
  } else {
    ageTitle = isEn ? "Protect & Grow" : "守护与增长并重";
    ageBody = isEn
      ? "At this stage, protecting what you've built is as important as growing it. Focus on stable assets and retirement readiness."
      : "这个阶段，保护现有财富和增值同样重要，专注于稳健资产和退休规划。";
  }

  return [
    { icon: <ShieldCheck className="size-4" />, title: efTitle, body: efBody },
    { icon: <TrendingUp className="size-4" />, title: srTitle, body: srBody },
    { icon: <Target className="size-4" />, title: gtTitle, body: gtBody },
    { icon: <Star className="size-4" />, title: ageTitle, body: ageBody },
  ];
}

function ActionPlanCard({ icon, title, body }: ActionPoint) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-xs font-semibold text-foreground mb-1">{title}</div>
        <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
      </div>
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
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [submittedEmails] = useState(() => new Set<string>());

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
    setUnlockError(null);

    const cleanEmail = email.trim().toLowerCase();

    // Prevent duplicate submissions from the same email in this session
    if (submittedEmails.has(cleanEmail)) {
      setUnlocked(true);
      setUnlockDone(true);
      setUnlockLoading(false);
      return;
    }

    try {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase client not initialised");
      if (!result) throw new Error("No snapshot result to save");

      const payload = {
        email: cleanEmail,
        region: region || null,
        age: parseInt(inputs.age) || null,
        monthly_income: parseFloat(inputs.income) || null,
        monthly_expenses: parseFloat(inputs.expenses) || null,
        current_savings: parseFloat(inputs.savings) || null,
        main_goal: inputs.goal || null,
        timeline_months: parseInt(inputs.timeline) || null,
        health_score: result.score,
        fa_interest: null as boolean | null,
      };

      console.log("INSERTING_TO_TABLE: financial_snapshots");
      console.log("[Finara] insert payload:", payload);

      const { error } = await supabase.from("financial_snapshots").insert(payload);

      if (error) {
        const errMsg = `Supabase insert error [${error.code}]: ${error.message}${error.hint ? " — " + error.hint : ""}`;
        console.error("[Finara] insert error:", errMsg, error);
        throw new Error(errMsg);
      }

      console.log("[Finara] insert success for", cleanEmail, "score:", payload.health_score);

      submittedEmails.add(cleanEmail);
      setUnlocked(true);
      setUnlockDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Finara] financial_snapshot save failed:", msg);
      setUnlockError(msg);
    } finally {
      setUnlockLoading(false);
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
              <p className="text-sm text-foreground/70 italic mb-3">{result.scoreInterpretation}</p>

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

              {/* Reassurance */}
              <p className="mt-4 text-center text-sm text-muted-foreground italic">"{result.reassurance}"</p>
            </div>

            {/* Three insight cards */}
            <div className="grid gap-3 sm:grid-cols-3">
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
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                      <div className="text-base font-semibold text-emerald-800">{s.unlockSuccess}</div>
                    </div>

                    {/* Personalized action plan */}
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-3">{s.comingSoon}</p>
                      <p className="text-xs text-muted-foreground mb-4">{s.actionPlanHeader}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {buildActionPlan(inputs, lang).map((pt, i) => (
                          <ActionPlanCard key={i} {...pt} />
                        ))}
                      </div>
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
                        <p className="text-[11px] text-muted-foreground mt-2 text-center">{s.faTrustNote}</p>
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
                    {unlockError && (
                      <p className="text-center text-xs text-destructive">{unlockError}</p>
                    )}
                    <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="size-3 text-primary shrink-0" />
                      <span>{s.privacyNote}</span>
                    </div>
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
