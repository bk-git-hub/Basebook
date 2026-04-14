import Link from "next/link";
import type { ReactNode } from "react";

type AppShellSection = "season" | "entries" | "season-book" | "order";

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

type AppShellProps = {
  activeSection: AppShellSection;
  title: string;
  description: string;
  children: ReactNode;
};

export function AppShell({
  activeSection,
  title,
  description,
  children,
}: AppShellProps) {
  const highlightedSection =
    activeSection === "order" ? "season-book" : activeSection;

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-6 text-stone-950 sm:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-4">
          <div className="rounded-[28px] border border-stone-200 bg-white/90 px-5 py-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <Link
                  href="/"
                  className="inline-flex text-sm font-semibold tracking-[0.24em] text-stone-950 uppercase"
                >
                  Sweetbook
                </Link>
                <p className="text-sm leading-6 text-stone-500">
                  기록 작성부터 시즌북 주문까지 이어지는 팬 저널 앱입니다.
                </p>
              </div>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-white"
              >
                랜딩으로 돌아가기
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
                      isActive
                        ? "bg-stone-950 text-white shadow-sm"
                        : "border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-[24px] border border-stone-200/80 bg-stone-50/80 px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold tracking-[0.18em] text-stone-400 uppercase">
              {SECTION_LABELS[activeSection]}
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-stone-950">
              {title}
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {description}
            </p>
          </div>
        </header>

        {children}
      </div>
    </main>
  );
}
