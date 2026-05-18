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
  snapshot: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    age: string;
    income: string;
    expenses: string;
    currentSavings: string;
    goalLabel: string;
    timelineLabel: string;
    months: string;
    cta: string;
    goals: { emergency: string; travel: string; house: string; retirement: string; investment: string };
    analysisLabel: string;
    scoreLabel: string;
    looksGood: string;
    needsAttention: string;
    nextMove: string;
    unlockTitle: string;
    unlockSubtitle: string;
    blurred1Title: string;
    blurred1Lines: string[];
    blurred2Title: string;
    blurred2Lines: string[];
    comingSoon: string;
    comingSoonSub: string;
    emailLabel: string;
    regionLabel: string;
    regions: { sg: string; my_in_sg: string; my: string; id: string; th: string; other: string };
    unlockCta: string;
    unlocking: string;
    privacyNote: string;
    faPrompt: string;
    faYes: string;
    faNo: string;
    faThanks: string;
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
    alreadyOnWaitlist: string;
    waitlistNotConfigured: string;
    waitlistError: string;
    thankyou: string;
    nospam: string;
    rights: string;
    privacy: string;
    terms: string;
    disclaimer: string;
    disclaimerText: string;
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
    trusted: "Now in Private Beta",
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
      rateGood: (r) => `Beautiful work — saving ${r}% of your income shows real intention. Keep nurturing this habit.`,
      rateTip: (r) => `You're saving ${r}% — a solid start. Gently growing toward 20% could open up more freedom over time.`,
      rateWarn: (r) => `You're saving ${r}% right now. Small habits today can create more freedom tomorrow — even tiny shifts add up.`,
      targetGood: (m) => `Your goal feels well within reach — setting aside ${m} a month should feel comfortable, not stressful.`,
      targetWarn: (gap) => `A few small adjustments could help you comfortably reach your goal — about ${gap} more a month, or a little more time, would do it.`,
      targetRebalance: "Let's gently rebalance first. Once your everyday spending feels lighter than your income, your goal becomes much easier to hold.",
      faster: (m, sooner) => `If you ever feel ready to lean in fully, you could reach this in around ${m} months — about ${sooner} sooner. No pressure, just possibility.`,
      starter: (b) => `Start gently with a ${b} cushion — small wins build real confidence, and momentum follows.`,
      automate: (a) => `Try quietly automating ${a} on payday — letting it happen in the background takes the willpower out of saving.`,
    },
  },
  snapshot: {
    eyebrow: "Free · Takes 1 minute",
    titleA: "Get Your ",
    titleB: "Financial Snapshot",
    subtitle: "See where you stand financially in just 1 minute.",
    age: "Age",
    income: "Monthly Income",
    expenses: "Monthly Expenses",
    currentSavings: "Current Savings",
    goalLabel: "Main Goal",
    timelineLabel: "Timeline:",
    months: "months",
    cta: "Get My Financial Snapshot",
    goals: { emergency: "Emergency Fund", travel: "Travel", house: "House / Property", retirement: "Retirement", investment: "Investment" },
    analysisLabel: "Finara AI analysis",
    scoreLabel: "Financial Health Score",
    looksGood: "What Looks Good",
    needsAttention: "What Needs Attention",
    nextMove: "Suggested Next Move",
    unlockTitle: "Unlock Your Full AI Financial Analysis",
    unlockSubtitle: "Enter your email to unlock personalized insights",
    blurred1Title: "Detailed Spending Breakdown",
    blurred1Lines: ["Housing & fixed costs: 52%", "Food & lifestyle: 28%", "Savings potential: 20%"],
    blurred2Title: "Personalised Action Plan",
    blurred2Lines: ["Step 1: Build 3-month emergency fund", "Step 2: Automate $200 savings on payday", "Step 3: Optimise CPF contributions"],
    comingSoon: "Coming Soon: Your Personalised AI Financial Action Plan",
    comingSoonSub: "We'll notify you when your full plan is ready. Check your email.",
    emailLabel: "Email Address",
    regionLabel: "Your Region",
    regions: { sg: "Singapore", my_in_sg: "Malaysian working in Singapore", my: "Malaysia", id: "Indonesia", th: "Thailand", other: "Others" },
    unlockCta: "Unlock My Analysis",
    unlocking: "Saving…",
    privacyNote: "No spam. Your data is private and never shared.",
    faPrompt: "Want a licensed financial consultant to review your financial situation?",
    faYes: "Yes, I'm interested",
    faNo: "Not now",
    faThanks: "Great! A licensed consultant will reach out to you soon.",
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
    alreadyOnWaitlist: "You're already on the waitlist.",
    waitlistNotConfigured: "Waitlist is not configured yet.",
    waitlistError: "Something went wrong. Please try again.",
    thankyou: "You're on the list! 🎉 We'll reach out when Finara launches.",
    nospam: "No spam. Unsubscribe anytime.",
    rights: "Crafted with care",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    disclaimer: "Disclaimer",
    disclaimerText:
      "Finara AI provides educational financial insights only and does not offer financial or investment advice.",
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
    trusted: "现已进入内测阶段",
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
      rateGood: (r) => `做得很棒——${r}% 的储蓄率体现了你的用心，继续温柔地坚持这个习惯吧。`,
      rateTip: (r) => `你正在存下 ${r}%，已经是很好的开始。慢慢靠近 20%，未来会有更多自在的空间。`,
      rateWarn: (r) => `目前的储蓄率是 ${r}%。今天的小习惯，会换来明天更多的自由——一点点改变就够了。`,
      targetGood: (m) => `这个目标对你来说很从容——每月留出 ${m}，应该感觉轻松而非紧绷。`,
      targetWarn: (gap) => `只需做一些小小的调整，目标就能舒服地达成——每月再多 ${gap}，或给自己多一点时间，都可以。`,
      targetRebalance: "先让生活节奏轻轻回到平衡。当日常开销比收入更从容时，目标自然会更容易承载。",
      faster: (m, sooner) => `如果哪天你想全力前进，大约 ${m} 个月就能抵达——比预期早 ${sooner} 个月。不急，只是一种可能。`,
      starter: (b) => `先从 ${b} 的小缓冲开始——小小的胜利会带来真实的信心，节奏会自然形成。`,
      automate: (a) => `试着在发薪日悄悄自动存入 ${a}——让它在背景里发生，省下意志力，也省下挣扎。`,
    },
  },
  snapshot: {
    eyebrow: "免费 · 仅需 1 分钟",
    titleA: "获取你的 ",
    titleB: "财务快照",
    subtitle: "1 分钟了解你的财务状况。",
    age: "年龄",
    income: "每月收入",
    expenses: "每月支出",
    currentSavings: "当前储蓄",
    goalLabel: "主要目标",
    timelineLabel: "时间线：",
    months: "个月",
    cta: "获取我的财务快照",
    goals: { emergency: "应急基金", travel: "旅行", house: "购房 / 置产", retirement: "退休", investment: "投资" },
    analysisLabel: "Finara AI 分析",
    scoreLabel: "财务健康评分",
    looksGood: "做得好的地方",
    needsAttention: "需要关注",
    nextMove: "建议下一步",
    unlockTitle: "解锁你的完整 AI 财务分析",
    unlockSubtitle: "输入邮箱，解锁个性化洞察",
    blurred1Title: "详细支出分析",
    blurred1Lines: ["住房及固定支出：52%", "餐饮及生活：28%", "储蓄潜力：20%"],
    blurred2Title: "个性化行动计划",
    blurred2Lines: ["第一步：建立 3 个月应急基金", "第二步：发薪日自动存入 $200", "第三步：优化公积金供款"],
    comingSoon: "即将推出：你的个性化 AI 财务行动计划",
    comingSoonSub: "计划准备好后我们将通知你，请留意邮件。",
    emailLabel: "邮箱地址",
    regionLabel: "所在地区",
    regions: { sg: "新加坡", my_in_sg: "在新加坡工作的马来西亚人", my: "马来西亚", id: "印度尼西亚", th: "泰国", other: "其他地区" },
    unlockCta: "解锁我的分析",
    unlocking: "保存中…",
    privacyNote: "不会发送垃圾邮件，你的数据绝不共享。",
    faPrompt: "希望持牌财务顾问为你审查财务状况吗？",
    faYes: "是的，我感兴趣",
    faNo: "暂时不需要",
    faThanks: "太好了！持牌顾问将尽快与你联系。",
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
    alreadyOnWaitlist: "你已在候补名单中。",
    waitlistNotConfigured: "候补名单尚未配置。",
    waitlistError: "提交失败，请稍后再试。",
    thankyou: "你已加入候补名单！🎉 Finara 上线时我们会第一时间通知你。",
    nospam: "没有垃圾邮件。可随时退订。",
    rights: "用心打造",
    privacy: "隐私政策",
    terms: "服务条款",
    disclaimer: "免责声明",
    disclaimerText:
      "Finara AI 仅提供教育性质的财务见解，不构成任何财务或投资建议。",
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
