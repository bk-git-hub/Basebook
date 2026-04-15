import Link from "next/link";
import type { ReactNode } from "react";

type AppShellSection = "season" | "entries" | "season-book" | "order";
type AppShellTone = "default" | "home";

const SECTION_LABELS: Record<AppShellSection, string> = {
  season: "",
  entries: "기록 작성",
  "season-book": "시즌북 제작",
  order: "주문 진행",
};

const TONE_STYLES: Record<
  AppShellTone,
  {
    page: string;
    returnLink: string;
    sectionCard: string;
    sectionLabel: string;
    sectionTitle: string;
    sectionDescription: string;
  }
> = {
  default: {
    page: "bg-stone-100 text-stone-950",
    returnLink:
      "inline-flex items-center justify-center rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-white",
    sectionCard:
      "rounded-[24px] border border-stone-200/80 bg-stone-50/80 px-5 py-4 shadow-sm",
    sectionLabel: "text-stone-400",
    sectionTitle: "text-stone-950",
    sectionDescription: "text-stone-600",
  },
  home: {
    page: "bg-white text-[#11284f]",
    returnLink:
      "inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-4 py-2.5 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]",
    sectionCard:
      "rounded-[24px] border border-[#e5ecf6] bg-[#fbfdff] px-5 py-4 shadow-[0_12px_30px_rgba(17,40,79,0.05)]",
    sectionLabel: "text-[#c42d3c]",
    sectionTitle: "text-[#11284f]",
    sectionDescription: "text-[#5a6f91]",
  },
};

type AppShellProps = {
  activeSection: AppShellSection;
  title: string;
  description?: string;
  sectionLabelOverride?: string | null;
  tone?: AppShellTone;
  children: ReactNode;
};

export function AppShell({
  activeSection,
  title,
  description,
  sectionLabelOverride,
  tone = "default",
  children,
}: AppShellProps) {
  const styles = TONE_STYLES[tone];
  const sectionLabel =
    sectionLabelOverride === undefined
      ? SECTION_LABELS[activeSection]
      : sectionLabelOverride;

  return (
    <main className={`min-h-screen px-6 py-6 sm:px-10 ${styles.page}`}>
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <div className={styles.sectionCard}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <Link href="/" className={`${styles.returnLink} shrink-0`}>
                홈으로 돌아가기
              </Link>

              <div className="space-y-2">
                {sectionLabel ? (
                  <p
                    className={`text-xs font-semibold tracking-[0.18em] uppercase ${styles.sectionLabel}`}
                  >
                    {sectionLabel}
                  </p>
                ) : null}
                <p
                  className={`text-lg font-semibold tracking-tight ${styles.sectionTitle}`}
                >
                  {title}
                </p>
                {description ? (
                  <p
                    className={`text-sm leading-6 ${styles.sectionDescription}`}
                  >
                    {description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
