import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "zh";

type Dict = {
  nav: { features: string; planner: string; getStarted: string; waitlist: string };
  hero: {
    badge: string;
    title1: string;
    title2: string;
    titleEnd: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    security: string;
    trusted: string;
    phone: {
      greeting: string;
      goal: string;
      saved: string;
      ofTarget: string;
      tip: string;
      autoSave: string;
      roundUps: string;
      ask: string;
    };
  };
  features: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    titleEnd: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  calc: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    titleEnd: string;
    subtitle: string;
    goal: string;
    currency: string;
    presets: { emergency: string; travel: string; house: string; wedding: string; retirement: string; investment: string };
    presetHint: string;
    income: string;
    expenses: string;
    target: string;
    timeline: string;
    months: (n: number) => string;
    breakDown: string;
    hideBreakdown: string;
    totalCategories: string;
    perMo: string;
    disposable: string;
    analysis: string;
    saveEachMonth: string;
    withinReach: (pct: number) => string;
    aboveDisposable: (gap: string) => string;
    savingsRate: string;
    eta: string;
    health: string;
    healthLabel: string;
    healthStrong: string;
    healthBuilding: string;
    healthFragile: string;
    onTrack: string;
    stretch: string;
    rebalance: string;
    buildPlan: string;
    save: string;
    saveModal: {
      title: string;
      subtitle: string;
      google: string;
      email: string;
      emailPlaceholder: string;
      continue: string;
      or: string;
      privacy: string;
      success: string;
      close: string;
    };
    categories: { housing: string; food: string; transport: string; shopping: string; entertainment: string; other: string };
    insights: {
      rateGood: (r: number) => string;
      rateTip: (r: number) => string;
      rateWarn: (r: number) => string;
      targetGood: (m: string) => string;
      targetWarn: (gap: string) => string;
      targetRebalance: string;
      faster: (m: number, sooner: number) => string;
      starter: (b: string) => string;
      automate: (a: string) => string;
    };
  };
  cta: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    titleHighlight: string;
    subtitle: string;
    placeholder: string;
    button: string;
    success: string;
    nospam: string;
    rights: string;
    privacy: string;
    terms: string;
    contact: string;
  };
};

const fmt = (lang: Lang) => (n: number) =>
  lang === "zh" ? `¥${Math.round(n).toLocaleString()}` : `$${Math.round(n).toLocaleString()}`;

const fmtCur = (lang: Lang, n: number) => fmt(lang)(n);

const en: Dict = {
  nav: { features: "Features", planner: "Planner", getStarted: "Get started", waitlist: "Join waitlist" },
  hero: {
    badge: "Now in private beta · Built for global earners",
    title1: "Your ",
    title2: "AI Financial",
    titleEnd: "Companion.",
    subtitle:
      "Plan savings goals, improve financial habits, and build a better future with AI — designed for young professionals and overseas workers.",
    primaryCta: "Start planning free",
    secondaryCta: "See it in action",
    security: "Bank-grade security",
    trusted: "Trusted by 12k+ early users",
    phone: {
      greeting: "Good morning, Maya",
      goal: "Tokyo Trip Goal",
      saved: "Saved",
      ofTarget: "of $5,000 · on track for Aug",
      tip: "AI tip · Skip 2 takeouts",
      autoSave: "Auto-save Friday",
      roundUps: "Round-ups",
      ask: "Ask Finara AI",
    },
  },
  features: {
    eyebrow: "Why Finara",
    titleA: "Money clarity, ",
    titleB: "designed for life",
    titleEnd: ".",
    subtitle: "Six quietly powerful tools, one calm interface. Finara handles the math so you can focus on the moments.",
    items: [
      { title: "AI Savings Coach", desc: "Personalized nudges that learn your income patterns and spending habits." },
      { title: "Goal Planner", desc: "Turn dreams into milestones — homes, weddings, travel, emergencies." },
      { title: "Built for OFWs", desc: "Multi-currency, remittance-aware, and timezone-friendly insights." },
      { title: "Habit Insights", desc: "See where money leaks and how small changes compound over time." },
      { title: "Smart Auto-Save", desc: "Round-ups and rules quietly grow your goals in the background." },
      { title: "Private & Secure", desc: "End-to-end encryption. Your data is yours — never sold, ever." },
    ],
  },
  calc: {
    eyebrow: "AI Goal Planner",
    titleA: "Try the ",
    titleB: "savings preview",
    titleEnd: ".",
    subtitle: "Enter your real numbers. Finara calculates your plan, your health score, and what to do next.",
    goal: "Goal",
    currency: "Currency",
    presets: { emergency: "Emergency Fund", travel: "Travel", house: "House", wedding: "Wedding", retirement: "Retirement", investment: "Investment" },
    presetHint: "Suggested target & timeline applied",
    income: "Monthly income",
    expenses: "Monthly expenses",
    target: "Savings target",
    timeline: "Timeline",
    months: (n) => `${n} months`,
    breakDown: "Break down expenses",
    hideBreakdown: "Hide breakdown",
    totalCategories: "Total from categories",
    perMo: "/ mo",
    disposable: "Disposable income",
    analysis: "Finara AI analysis",
    saveEachMonth: "Save this much each month",
    withinReach: (pct) => `Within reach — uses ${pct}% of disposable income.`,
    aboveDisposable: (gap) => `Above your current disposable income by ${gap}.`,
    savingsRate: "Savings rate",
    eta: "Goal ETA",
    health: "Health",
    healthLabel: "Financial health",
    healthStrong: "Strong",
    healthBuilding: "Building",
    healthFragile: "Fragile",
    onTrack: "On track",
    stretch: "Stretch goal",
    rebalance: "Rebalance",
    buildPlan: "Build my full plan",
    save: "Save my plan",
    saveModal: {
      title: "Save your financial journey",
      subtitle: "Create a free account to save your AI financial plan and continue tracking your progress anytime.",
      google: "Continue with Google",
      email: "Continue with Email",
      emailPlaceholder: "you@email.com",
      continue: "Continue",
      or: "or",
      privacy: "By continuing you agree to our Terms & Privacy.",
      success: "Plan saved ✓ We'll email you a magic link.",
      close: "Close",
    },
    categories: {
      housing: "Housing", food: "Food", transport: "Transport",
      shopping: "Shopping", entertainment: "Entertainment", other: "Other expenses",
    },
    insights: {
      rateGood: (r) => `Your savings rate of ${r}% is healthy — above the 20% benchmark.`,
      rateTip: (r) => `Your savings rate is ${r}%. Aiming for 20% would accelerate your goal meaningfully.`,
      rateWarn: (r) => `Your savings rate is only ${r}%. Trim a recurring expense to free up cash flow.`,
      targetGood: (m) => `Your target is realistic — you can comfortably set aside ${m}/mo.`,
      targetWarn: (gap) => `You're short by ${gap}/mo. Reduce discretionary spending or extend the timeline.`,
      targetRebalance: "Expenses meet or exceed income. Rebalance your budget before committing to a goal.",
      faster: (m, sooner) => `At full disposable income you could hit your goal in ~${m} months — ${sooner} months sooner.`,
      starter: (b) => `Build a ${b} starter buffer first — small wins compound.`,
      automate: (a) => `Automate ${a} on payday to stay consistent without thinking.`,
    },
  },
  cta: {
    eyebrow: "Join the waitlist",
    titleA: "Build a better",
    titleB: "financial future, ",
    titleHighlight: "today",
    subtitle: "Be among the first to try Finara AI. Early users get lifetime Pro features, free.",
    placeholder: "you@email.com",
    button: "Get early access",
    success: "You're in ✓",
    nospam: "No spam. Unsubscribe anytime.",
    rights: "Crafted with care",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
  },
};

const zh: Dict = {
  nav: { features: "功能", planner: "规划器", getStarted: "立即开始", waitlist: "加入候补名单" },
  hero: {
    badge: "内测中 · 为全球工作者打造",
    title1: "你的 ",
    title2: "AI 财务",
    titleEnd: "陪伴助手。",
    subtitle: "用 AI 规划储蓄目标、改善理财习惯、构建更好的未来——专为年轻职场人与海外工作者设计。",
    primaryCta: "免费开始规划",
    secondaryCta: "查看演示",
    security: "银行级安全",
    trusted: "已有超过 12,000 位早期用户",
    phone: {
      greeting: "早上好，Maya",
      goal: "东京旅行目标",
      saved: "已储蓄",
      ofTarget: "目标 $5,000 · 8 月可达成",
      tip: "AI 建议 · 少叫两次外卖",
      autoSave: "周五自动储蓄",
      roundUps: "零钱凑整",
      ask: "询问 Finara AI",
    },
  },
  features: {
    eyebrow: "为什么选择 Finara",
    titleA: "理财清晰，",
    titleB: "为生活而设计",
    titleEnd: "。",
    subtitle: "六个低调而强大的工具，一个平静的界面。Finara 处理数字，让你专注当下。",
    items: [
      { title: "AI 储蓄教练", desc: "个性化提醒，理解你的收入节奏与消费习惯。" },
      { title: "目标规划器", desc: "将梦想变成里程碑——购房、婚礼、旅行、应急。" },
      { title: "为海外工作者打造", desc: "多币种、汇款友好、跨时区的智能洞察。" },
      { title: "习惯洞察", desc: "看清资金流向，发现小改变如何随时间复利。" },
      { title: "智能自动储蓄", desc: "凑整与规则在后台默默地让目标增长。" },
      { title: "隐私与安全", desc: "端到端加密。你的数据属于你——永不出售。" },
    ],
  },
  calc: {
    eyebrow: "AI 目标规划器",
    titleA: "试试 ",
    titleB: "储蓄预览",
    titleEnd: "。",
    subtitle: "输入你的真实数字。Finara 计算计划、健康评分，并告诉你下一步该做什么。",
    goal: "目标",
    currency: "货币",
    presets: { emergency: "应急基金", travel: "旅行", house: "购房", wedding: "婚礼", retirement: "退休", investment: "投资" },
    presetHint: "已应用建议目标与时间",
    income: "每月收入",
    expenses: "每月支出",
    target: "储蓄目标",
    timeline: "目标时间",
    months: (n) => `${n} 个月`,
    breakDown: "细分支出",
    hideBreakdown: "收起细分",
    totalCategories: "分类合计",
    perMo: "/ 月",
    disposable: "可支配收入",
    analysis: "Finara AI 分析",
    saveEachMonth: "每月需储蓄",
    withinReach: (pct) => `可以达成——占可支配收入的 ${pct}%。`,
    aboveDisposable: (gap) => `超出当前可支配收入 ${gap}。`,
    savingsRate: "储蓄率",
    eta: "预计达成",
    health: "健康度",
    healthLabel: "财务健康度",
    healthStrong: "强健",
    healthBuilding: "建设中",
    healthFragile: "脆弱",
    onTrack: "进度良好",
    stretch: "略具挑战",
    rebalance: "需要调整",
    buildPlan: "生成完整计划",
    save: "保存我的计划",
    saveModal: {
      title: "保存你的财务旅程",
      subtitle: "创建免费账户，保存你的 AI 财务计划，随时继续追踪你的进度。",
      google: "使用 Google 继续",
      email: "使用邮箱继续",
      emailPlaceholder: "you@email.com",
      continue: "继续",
      or: "或",
      privacy: "继续即表示你同意我们的条款与隐私政策。",
      success: "计划已保存 ✓ 我们会发送登录链接到你的邮箱。",
      close: "关闭",
    },
    categories: {
      housing: "住房", food: "饮食", transport: "交通",
      shopping: "购物", entertainment: "娱乐", other: "其他支出",
    },
    insights: {
      rateGood: (r) => `你的储蓄率为 ${r}%，高于 20% 的健康基准。`,
      rateTip: (r) => `你的储蓄率为 ${r}%。提升至 20% 将明显加速你的目标。`,
      rateWarn: (r) => `你的储蓄率仅为 ${r}%。建议削减一项固定开支以释放现金流。`,
      targetGood: (m) => `目标合理——你可以每月稳定存入 ${m}。`,
      targetWarn: (gap) => `每月差额 ${gap}。可减少非必要消费或延长时间。`,
      targetRebalance: "支出已等于或超过收入。请先调整预算，再设定目标。",
      faster: (m, sooner) => `若用全部可支配收入储蓄，约 ${m} 个月可达成——比预期早 ${sooner} 个月。`,
      starter: (b) => `先建立 ${b} 的启动缓冲——小胜也能复利。`,
      automate: (a) => `在发薪日自动储蓄 ${a}，无需思考即可坚持。`,
    },
  },
  cta: {
    eyebrow: "加入候补名单",
    titleA: "今天就开始构建，",
    titleB: "更好的财务未来，",
    titleHighlight: "现在",
    subtitle: "成为最早体验 Finara AI 的用户。早期用户终身免费享受 Pro 功能。",
    placeholder: "you@email.com",
    button: "获取早鸟权益",
    success: "已加入 ✓",
    nospam: "没有垃圾邮件。可随时退订。",
    rights: "用心打造",
    privacy: "隐私政策",
    terms: "条款",
    contact: "联系我们",
  },
};

const dicts: Record<Lang, Dict> = { en, zh };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("finara-lang") as Lang | null;
      if (saved === "en" || saved === "zh") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("finara-lang", l); } catch {}
  };

  return (
    <I18nCtx.Provider value={{ lang, setLang, t: dicts[lang] }}>
      <div lang={lang === "zh" ? "zh-CN" : "en"} className={lang === "zh" ? "lang-zh" : "lang-en"}>
        {children}
      </div>
    </I18nCtx.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
