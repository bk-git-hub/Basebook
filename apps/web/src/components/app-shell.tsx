import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AppShellSection = "season" | "entries" | "season-book" | "order";
type AppShellTone = "default" | "home";

type NavigationItem = {
  href: string;
  label: string;
  section: AppShellSection;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    href: "/season",
    label: "시즌 대시보드",
    section: "season",
  },
  {
    href: "/entries/new",
    label: "새 기록",
    section: "entries",
  },
  {
    href: "/season-book/new",
    label: "시즌북 만들기",
    section: "season-book",
  },
];

const SECTION_LABELS: Record<AppShellSection, string> = {
  season: "기록 흐름",
  entries: "기록 작성",
  "season-book": "시즌북 제작",
  order: "주문 진행",
};

const TONE_STYLES: Record<
  AppShellTone,
  {
    page: string;
    headerCard: string;
    brandText: string;
    helperText: string;
    returnLink: string;
    navActive: string;
    navInactive: string;
    sectionCard: string;
    sectionLabel: string;
    sectionTitle: string;
    sectionDescription: string;
  }
> = {
  default: {
    page: "bg-stone-100 text-stone-950",
    headerCard:
      "rounded-[28px] border border-stone-200 bg-white/90 px-5 py-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-6",
    brandText: "text-stone-950",
    helperText: "text-stone-500",
    returnLink:
      "inline-flex items-center justify-center rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-white",
    navActive: "bg-stone-950 text-white shadow-sm",
    navInactive:
      "border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50",
    sectionCard:
      "rounded-[24px] border border-stone-200/80 bg-stone-50/80 px-5 py-4 shadow-sm",
    sectionLabel: "text-stone-400",
    sectionTitle: "text-stone-950",
    sectionDescription: "text-stone-600",
  },
  home: {
    page: "bg-white text-[#11284f]",
    headerCard:
      "rounded-[28px] border border-[#e5ecf6] bg-white px-5 py-5 shadow-[0_16px_40px_rgba(17,40,79,0.05)] sm:px-6",
    brandText: "text-[#11284f]",
    helperText: "text-[#5a6f91]",
    returnLink:
      "inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-4 py-2.5 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]",
    navActive:
      "bg-[#11284f] text-white shadow-[0_10px_24px_rgba(17,40,79,0.18)]",
    navInactive:
      "border border-[#d4ddeb] bg-white text-[#4d6284] hover:border-[#aebfd8] hover:bg-[#f8fbff] hover:text-[#11284f]",
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
  description: string;
  tone?: AppShellTone;
  children: ReactNode;
};

export function AppShell({
  activeSection,
  title,
  description,
  tone = "default",
  children,
}: AppShellProps) {
  const highlightedSection =
    activeSection === "order" ? "season-book" : activeSection;
  const styles = TONE_STYLES[tone];

  return (
    <main className={`min-h-screen px-6 py-6 sm:px-10 ${styles.page}`}>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-4">
          <div className={styles.headerCard}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-3"
                >
                  <Image
                    src="/basebook.png"
                    alt="Basebook"
                    width={88}
                    height={88}
                    className="h-10 w-10 rounded-[14px] bg-white object-cover"
                  />
                  <span
                    className={`text-sm font-semibold tracking-[0.24em] uppercase ${styles.brandText}`}
                  >
                    Basebook
                  </span>
                </Link>
                <p className={`text-sm leading-6 ${styles.helperText}`}>
                  기록 작성부터 시즌북 주문까지 이어지는 팬 저널 앱입니다.
                </p>
              </div>

              <Link
                href="/"
                className={styles.returnLink}
              >
                홈으로 돌아가기
              </Link>
            </div>

            <nav className="mt-5 flex flex-wrap gap-2">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = item.section === highlightedSection;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive ? styles.navActive : styles.navInactive
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className={styles.sectionCard}>
            <p
              className={`text-xs font-semibold tracking-[0.18em] uppercase ${styles.sectionLabel}`}
            >
              {SECTION_LABELS[activeSection]}
            </p>
            <p
              className={`mt-2 text-lg font-semibold tracking-tight ${styles.sectionTitle}`}
            >
              {title}
            </p>
            <p className={`mt-2 text-sm leading-6 ${styles.sectionDescription}`}>
              {description}
            </p>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
