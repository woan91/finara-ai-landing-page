import { useState } from "react";
import { CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Lightbulb, Lock, ChevronDown, TrendingUp, ShieldCheck, Plane, Hop as Home, PiggyBank, ChartLine as LineChart, Sparkles, Target, Star } from "lucide-react";
import { useI18n } from "./i18n";
import { getSupabaseClient } from "@/lib/supabase";

// ─── Types ──────────────────────────────────────────────────────────────────

type GoalKey = "emergency" | "travel" | "house" | "retirement" | "investment";
type RegionKey = "sg" | "my_in_sg" | "my" | "id" | "th" | "other";

const EXPENSE_CATEGORY_KEYS = ["housing", "food", "transport", "insurance", "loans", "shopping", "others"] as const;
type ExpenseCatKey = typeof EXPENSE_CATEGORY_KEYS[number];

interface Inputs {
  age: string;
  income: string;
  expenses: string;
  savings: string;
}

interface ExpenseBreakdown {
  housing: string;
  food: string;
  transport: string;
  insurance: string;
  loans: string;
  shopping: string;
  others: string;
}

interface SnapshotResult {
  score: number;
  scoreLabel: string;
  scoreColor: string;
  scoreInterpretation: string;
  looks_good: string[];
  needs_attention: string[];
  next_move: string[];
  on_track: boolean;
  reassurance: string;
  expenseDiagnosis: string[];
}

// ─── Score Engine ────────────────────────────────────────────────────────────

function computeSnapshot(inputs: Inputs, breakdown: ExpenseBreakdown | null, lang: "en" | "zh"): SnapshotResult {
  const income = Math.max(1, parseFloat(inputs.income) || 0);
  const expenses = Math.max(0, parseFloat(inputs.expenses) || 0);
  const savings = Math.max(0, parseFloat(inputs.savings) || 0);
  const age = parseInt(inputs.age) || 25;

  const disposable = income - expenses;
  const savingsRate = disposable > 0 ? (disposable / income) * 100 : 0;

  const efMonths = expenses > 0 ? savings / expenses : 0;

  // ── Scoring (0–100) ──────────────────────────────────────────────────────
  const rateScore = Math.min(40, (savingsRate / 25) * 40);
  const efScore = Math.min(30, (Math.min(efMonths, 6) / 6) * 30);
  // Simple goal realism: disposable income vs. a baseline 10% savings target
  const baselineTarget = income * 0.1;
  const feasibility = baselineTarget > 0 ? Math.min(1, disposable / baselineTarget) : 0;
  const goalScore = Math.round(feasibility * 30);
  const score = Math.min(100, Math.round(rateScore + efScore + goalScore));

  // ── Score label & interpretation ─────────────────────────────────────────
  let scoreLabel: string;
  let scoreColor: string;
  let scoreInterpretation: string;

  if (score >= 85) {
    scoreLabel = lang === "zh" ? "卓越" : "Excellent";
    scoreColor = "oklch(0.45 0.17 165)";
    scoreInterpretation = lang === "zh"
      ? "你的储蓄一致，财务健康。继续保持这个好习惯——你走在正确的轨道上。"
      : "You're saving consistently — a great foundation. Keeping this habit going will make a real difference over time.";
  } else if (score >= 75) {
    scoreLabel = lang === "zh" ? "稳健" : "Strong";
    scoreColor = "oklch(0.52 0.15 165)";
    scoreInterpretation = lang === "zh"
      ? "你正在建立良好的财务基础，不过还有一些空间可以进一步加强应急储蓄。"
      : "You're building a good financial foundation, though there may still be room to strengthen your emergency savings.";
  } else if (score >= 65) {
    scoreLabel = lang === "zh" ? "进展良好" : "On Track";
    scoreColor = "oklch(0.62 0.16 140)";
    scoreInterpretation = lang === "zh"
      ? "你正在取得不错的进展。你的下一个机会或许是在储蓄和未来目标之间找到更好的平衡。"
      : "You're making good progress. Your next opportunity could be balancing savings and future investments.";
  } else if (score >= 50) {
    scoreLabel = lang === "zh" ? "有待改善" : "Needs Improvement";
    scoreColor = "oklch(0.68 0.16 55)";
    scoreInterpretation = lang === "zh"
      ? "你的支出是可以控制的。每月小幅提升储蓄，随着时间推移会产生很大的变化。"
      : "Your expenses are manageable. A small increase in monthly savings could make a big difference over time.";
  } else {
    scoreLabel = lang === "zh" ? "需要关注" : "Needs Attention";
    scoreColor = "oklch(0.60 0.20 30)";
    scoreInterpretation = lang === "zh"
      ? "加强你的应急基金可能会让你的财务更有安全感。从小处开始，一点一点地积累。"
      : "Strengthening your emergency fund may help you feel more financially secure. Starting small is perfectly fine.";
  }

  // ── Insight generation ────────────────────────────────────────────────────
  const looks_good: string[] = [];
  const needs_attention: string[] = [];
  const next_move: string[] = [];

  const savingsRateRounded = Math.round(savingsRate);
  const efDays = Math.round(efMonths * 30);
  const fivePct = Math.round(income * 0.05);

  if (lang === "en") {
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

    if (efMonths < 1) {
      needs_attention.push(`If your income stopped today, your savings may only support around ${efDays} days of expenses.`);
    } else if (efMonths < 3) {
      needs_attention.push(`Your savings cover about ${Math.round(efMonths * 30)} days of expenses — a 3-month buffer would meaningfully reduce your financial risk.`);
    }
    if (disposable <= 0) {
      needs_attention.push("You may be relying too heavily on future income rather than building financial breathing room.");
    } else if (savingsRate < 10) {
      needs_attention.push("A small shift in where your money goes each month could have a surprisingly large impact over time.");
    }
    if (needs_attention.length === 0) {
      needs_attention.push("Keep monitoring your expense-to-income ratio monthly — small drifts compound quickly over time.");
    }

    if (efMonths < 3 && disposable > 0) {
      next_move.push(`Setting aside a little more each month — even around $${fivePct.toLocaleString()} — could get your emergency fund to a healthier place.`);
    }
    if (savingsRate < 20 && disposable > 0 && efMonths >= 3) {
      next_move.push(`A small, painless reduction in spending — around $${fivePct.toLocaleString()}/month — could move your goal closer faster than you'd expect.`);
    }
    if (disposable <= 0) {
      next_move.push("Try identifying one recurring expense you could reduce slightly — even a small shift can start restoring your financial breathing room.");
    }
    if (next_move.length === 0) {
      next_move.push("Consider automating a small savings transfer on payday — when saving happens automatically, it stops feeling like a sacrifice.");
    }
  } else {
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

    if (efMonths < 1) {
      needs_attention.push(`如果你的收入今天停止，你的储蓄可能只能支撑约 ${efDays} 天的生活支出。`);
    } else if (efMonths < 3) {
      needs_attention.push(`你目前的储蓄约能维持 ${Math.round(efMonths * 30)} 天——建立 3 个月的应急缓冲将显著降低你的财务风险。`);
    }
    if (disposable <= 0) {
      needs_attention.push("你可能过度依赖未来的收入，而没有构建足够的财务喘息空间。");
    } else if (savingsRate < 10) {
      needs_attention.push("每月资金流向的微小调整，随着时间推移可能产生出乎意料的巨大影响。");
    }
    if (needs_attention.length === 0) {
      needs_attention.push("坚持每月监控你的收支比——微小的漂移随时间会快速复利积累。");
    }

    if (efMonths < 3 && disposable > 0) {
      next_move.push(`每月多储蓄 ${fivePct.toLocaleString()} 元，你的应急基金可在几个月内达到更健康的水平。`);
    }
    if (savingsRate < 20 && disposable > 0 && efMonths >= 3) {
      next_move.push(`每月削减约 ${fivePct.toLocaleString()} 元的非必要支出，对目标进度的加速效果会超出你的预期。`);
    }
    if (disposable <= 0) {
      next_move.push("从识别一项可减少的固定支出开始——即使减少 5–10%，也能恢复正向现金流。");
    }
    if (next_move.length === 0) {
      next_move.push("在发薪日自动转入储蓄——当储蓄在消费前先发生，它就不再感觉像是牺牲。");
    }
  }

  // ── Expense breakdown diagnosis ───────────────────────────────────────────
  const expenseDiagnosis: string[] = [];
  if (breakdown) {
    const housing = parseFloat(breakdown.housing) || 0;
    const food = parseFloat(breakdown.food) || 0;
    const transport = parseFloat(breakdown.transport) || 0;
    const shopping = (parseFloat(breakdown.shopping) || 0);

    if (housing / income > 0.30) {
      expenseDiagnosis.push(lang === "en"
        ? "Your housing costs are on the higher side. This is worth keeping an eye on as you plan your goals."
        : "你的住房支出偏高。在规划目标时，这是一个值得关注的方面。");
    }
    if (food / income > 0.15) {
      expenseDiagnosis.push(lang === "en"
        ? "Your food spending looks slightly higher than average. Small adjustments here may help you reach your goals faster."
        : "你的餐饮支出略高于平均水平。在这方面做一些小调整，可能帮助你更快实现目标。");
    }
    if (transport / income > 0.10) {
      expenseDiagnosis.push(lang === "en"
        ? "Your transport spending seems a little high compared to your income. Reviewing this may improve your savings flexibility."
        : "与收入相比，你的交通支出略高。重新审视这部分支出，可能会提升你的储蓄灵活性。");
    }
    if (shopping / income > 0.10) {
      expenseDiagnosis.push(lang === "en"
        ? "Your discretionary spending is slightly above average. Trimming a little here could make a meaningful difference over time."
        : "你的可支配消费略高于平均水平。在这里稍作削减，长期来看会产生显著的差异。");
    }
  }

  const reassurances = lang === "zh"
    ? ["你不需要完美的财务——只需要一个更好的计划。", "今天的小改变，能让未来感觉轻盈许多。", "你可能比自己想象的做得更好——现在让我们一起优化它。"]
    : ["You don't need perfect finances — just a better plan.", "Small changes today can make your future feel much lighter.", "You're probably doing better than you think — now let's improve it."];
  const reassurance = reassurances[score % 3];

  return {
    score, scoreLabel, scoreColor, scoreInterpretation,
    looks_good: looks_good.slice(0, 2),
    needs_attention: needs_attention.slice(0, 2),
    next_move: next_move.slice(0, 2),
    on_track: disposable >= income * 0.1,
    reassurance,
    expenseDiagnosis,
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

function buildActionPlan(inputs: Inputs, lang: "en" | "zh"): ActionPoint[] {
  const income = Math.max(1, parseFloat(inputs.income) || 0);
  const expenses = Math.max(0, parseFloat(inputs.expenses) || 0);
  const savings = Math.max(0, parseFloat(inputs.savings) || 0);
  const age = parseInt(inputs.age) || 25;

  const surplus = income - expenses;
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  const efMonths = expenses > 0 ? savings / expenses : 0;
  const fmt = (n: number) => Math.round(n).toLocaleString();
  const isEn = lang === "en";

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

  const nextGoalTitle = isEn ? "Your Next Goal" : "你的下一个目标";
  const nextGoalBody = isEn
    ? surplus > 0
      ? `With $${fmt(surplus)}/month available, the AI Goal Planner below can help you map out a realistic path to your next financial milestone.`
      : "Once you build a positive monthly surplus, use the AI Goal Planner below to map out your next financial milestone."
    : surplus > 0
      ? `你每月有 $${fmt(surplus)} 可用。下方的 AI 目标规划器可以帮助你规划下一个财务里程碑。`
      : "一旦建立正向的月度盈余，使用下方的 AI 目标规划器来规划你的下一个财务里程碑。";

  return [
    { icon: <ShieldCheck className="size-4" />, title: efTitle, body: efBody },
    { icon: <TrendingUp className="size-4" />, title: srTitle, body: srBody },
    { icon: <Star className="size-4" />, title: ageTitle, body: ageBody },
    { icon: <Target className="size-4" />, title: nextGoalTitle, body: nextGoalBody },
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

// ─── Shared event for auto-filling Calculator ─────────────────────────────────

export type SnapshotFillData = {
  income: number;
  expenses: number;
  savings: number;
};

// Simple global callback ref — avoids prop drilling / context for this cross-section use
let _onSnapshotFill: ((data: SnapshotFillData) => void) | null = null;
export function registerSnapshotFillCallback(cb: (data: SnapshotFillData) => void) {
  _onSnapshotFill = cb;
}

// ─── Main Component ──────────────────────────────────────────────────────────

const EXPENSE_LABELS_EN: Record<ExpenseCatKey, string> = {
  housing: "Housing / Rent",
  food: "Food",
  transport: "Transport",
  insurance: "Insurance",
  loans: "Loans / Debt",
  shopping: "Shopping & Entertainment",
  others: "Others",
};
const EXPENSE_LABELS_ZH: Record<ExpenseCatKey, string> = {
  housing: "住房 / 租金",
  food: "餐饮",
  transport: "交通",
  insurance: "保险",
  loans: "贷款 / 债务",
  shopping: "购物与娱乐",
  others: "其他",
};

export function FinancialSnapshot() {
  const { t, lang } = useI18n();
  const s = t.snapshot;

  const [inputs, setInputs] = useState<Inputs>({
    age: "", income: "", expenses: "", savings: "",
  });
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [breakdown, setBreakdown] = useState<ExpenseBreakdown>({
    housing: "", food: "", transport: "", insurance: "", loans: "", shopping: "", others: "",
  });
  const [result, setResult] = useState<SnapshotResult | null>(null);
  const [showUnlock, setShowUnlock] = useState(false);

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

  const expenseLabels = lang === "zh" ? EXPENSE_LABELS_ZH : EXPENSE_LABELS_EN;
  const breakdownTotal = EXPENSE_CATEGORY_KEYS.reduce((sum, k) => sum + (parseFloat(breakdown[k]) || 0), 0);

  // When breakdown is open and has values, sync total to expenses
  function handleBreakdownChange(key: ExpenseCatKey, val: string) {
    const next = { ...breakdown, [key]: val };
    setBreakdown(next);
    const total = EXPENSE_CATEGORY_KEYS.reduce((sum, k) => sum + (parseFloat(next[k]) || 0), 0);
    if (total > 0) {
      setInputs((p) => ({ ...p, expenses: String(Math.round(total)) }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hasBreakdown = breakdownOpen && breakdownTotal > 0;
    const r = computeSnapshot(inputs, hasBreakdown ? breakdown : null, lang);
    setResult(r);
    setShowUnlock(true);
    setTimeout(() => {
      document.getElementById("snapshot-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  function handleGoToPlanner() {
    const income = parseFloat(inputs.income) || 0;
    const expenses = parseFloat(inputs.expenses) || 0;
    const savings = parseFloat(inputs.savings) || 0;
    if (_onSnapshotFill) _onSnapshotFill({ income, expenses, savings });
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (unlockLoading || unlockDone) return;
    setUnlockLoading(true);
    setUnlockError(null);

    const cleanEmail = email.trim().toLowerCase();

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
        main_goal: null,
        timeline_months: null,
        health_score: result.score,
        fa_interest: null as boolean | null,
      };

      const { error } = await supabase.from("financial_snapshots").insert(payload);

      if (error) {
        throw new Error(`Supabase insert error [${error.code}]: ${error.message}${error.hint ? " — " + error.hint : ""}`);
      }

      submittedEmails.add(cleanEmail);
      setUnlocked(true);
      setUnlockDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[AskFinara] snapshot save failed:", msg);
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

              {/* Monthly Expenses + breakdown */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">{s.expenses}</label>
                <input
                  type="number" min="0" required
                  value={inputs.expenses} onChange={(e) => {
                    set("expenses")(e.target.value);
                    // If breakdown is open, clear it to avoid conflicts
                    if (breakdownOpen) setBreakdownOpen(false);
                  }}
                  placeholder="2800"
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition"
                />
                <button
                  type="button"
                  onClick={() => setBreakdownOpen((o) => !o)}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
                  aria-expanded={breakdownOpen}
                >
                  <ChevronDown className={`size-3.5 transition-transform ${breakdownOpen ? "rotate-180" : ""}`} />
                  {lang === "zh" ? "细分我的支出" : "Break down my expenses"}
                </button>

                {breakdownOpen && (
                  <div className="mt-3 rounded-2xl border border-border bg-secondary/40 p-4 animate-fade-up">
                    <div className="grid grid-cols-2 gap-3">
                      {EXPENSE_CATEGORY_KEYS.map((key) => (
                        <label key={key} className="block">
                          <span className="text-[11px] text-muted-foreground">{expenseLabels[key]}</span>
                          <input
                            type="number" min="0" placeholder="0"
                            value={breakdown[key]}
                            onChange={(e) => handleBreakdownChange(key, e.target.value)}
                            className="mt-1 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition"
                          />
                        </label>
                      ))}
                    </div>
                    {breakdownTotal > 0 && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{lang === "zh" ? "分类合计（已更新月支出）" : "Total (monthly expenses updated)"}</span>
                        <span className="font-semibold tabular-nums">{Math.round(breakdownTotal).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Current Savings */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5 text-foreground/80">{s.currentSavings}</label>
                <input
                  type="number" min="0" required
                  value={inputs.savings} onChange={(e) => set("savings")(e.target.value)}
                  placeholder="8000"
                  className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40 transition"
                />
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
                  <div className="text-sm font-semibold mt-1" style={{ color: result.scoreColor }}>
                    {result.scoreLabel}
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground/75 mb-3 leading-relaxed">{result.scoreInterpretation}</p>

              <ScoreBar score={result.score} color={result.scoreColor} />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                <span>0</span><span>50</span><span>100</span>
              </div>

              {/* Expense diagnosis (only if breakdown was filled) */}
              {result.expenseDiagnosis.length > 0 && (
                <div className="mt-5 rounded-2xl bg-amber-50 border border-amber-100 p-4 space-y-2">
                  {result.expenseDiagnosis.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-amber-800">
                      <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-500" />
                      <span>{msg}</span>
                    </div>
                  ))}
                </div>
              )}

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

            {/* "Now plan your goals" button */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleGoToPlanner}
                className="inline-flex items-center gap-2 rounded-full bg-primary-gradient text-primary-foreground px-8 py-3.5 text-sm font-semibold shadow-glow hover:scale-[1.02] transition-transform"
              >
                {lang === "zh" ? "现在，规划你的目标 →" : "Now, plan your goals →"}
              </button>
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

                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  <BlurredCard title={s.blurred1Title} lines={s.blurred1Lines} />
                  <BlurredCard title={s.blurred2Title} lines={s.blurred2Lines} />
                </div>

                {unlockDone ? (
                  <div className="animate-fade-up space-y-4">
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                      <div className="text-base font-semibold text-emerald-800">{s.unlockSuccess}</div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground mb-3">{s.comingSoon}</p>
                      <p className="text-xs text-muted-foreground mb-4">{s.actionPlanHeader}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {buildActionPlan(inputs, lang).map((pt, i) => (
                          <ActionPlanCard key={i} {...pt} />
                        ))}
                      </div>
                    </div>

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
