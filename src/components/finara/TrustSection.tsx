import { useI18n } from "./i18n";

export function TrustSection() {
  const { lang } = useI18n();

  const title = lang === "zh"
    ? "为对金钱感到困惑的人而生"
    : "Built for people who feel confused about money";

  const body = lang === "zh"
    ? "尤其是理财初学者、年轻在职人士，以及在新加坡工作、希望获得更清晰财务方向的马来西亚人。"
    : "Especially beginners, young working adults, and Malaysians working in Singapore who want clearer financial direction.";

  const urgency = lang === "zh"
    ? "我们正在逐步邀请早期用户，共同改善 AskFinara 的体验。"
    : "We're onboarding early users gradually to improve AskFinara together.";

  return (
    <section className="py-14 sm:py-20 bg-secondary/40">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <h2 className="font-display text-2xl sm:text-4xl tracking-tight">
          {title}
        </h2>
        <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          {body}
        </p>
        <p className="mt-6 text-sm text-muted-foreground/80">
          {urgency}
        </p>
      </div>
    </section>
  );
}
