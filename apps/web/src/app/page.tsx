import Link from "next/link";

const primaryNavigation = [
  { href: "/season", label: "시즌 대시보드" },
  { href: "/entries/new", label: "새 기록" },
  { href: "/season-book/new", label: "시즌북 만들기" },
];

const workflowSteps = [
  {
    step: "01",
    title: "경기를 고르고 기록합니다",
    description:
      "경기 후보를 불러오고, 사진과 감상을 붙여 한 경기의 기억을 정리합니다.",
  },
  {
    step: "02",
    title: "한 시즌의 순간을 고릅니다",
    description:
      "쌓인 직관 기록 중 시즌북에 담고 싶은 경기만 선택합니다.",
  },
  {
    step: "03",
    title: "견적을 만들고 주문합니다",
    description:
      "선택한 기록을 Sweetbook 책 제작 흐름으로 넘겨 견적과 주문까지 이어갑니다.",
  },
];

const routeCards = [
  {
    href: "/season",
    label: "대시보드",
    title: "시즌 기록 보기",
    description: "승패 요약과 최근 직관 기록을 한 화면에서 확인합니다.",
  },
  {
    href: "/entries/new",
    label: "작성",
    title: "새 직관 기록",
    description: "경기 후보, 사진 업로드, 감상 메모를 묶어 저장합니다.",
  },
  {
    href: "/season-book/new",
    label: "제작",
    title: "시즌북 만들기",
    description: "기록을 선택하고 시즌북 견적을 생성합니다.",
  },
  {
    href: "/order/demo-project",
    label: "주문",
    title: "주문 정보 입력",
    description: "견적 생성 뒤 배송 정보를 입력하는 주문 화면입니다.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 px-6 py-6 text-stone-950 sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
        <header className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.24em] text-stone-950 uppercase"
          >
            Sweetbook
          </Link>
          <nav className="flex flex-wrap gap-2">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="grid flex-1 items-stretch gap-6 py-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between rounded-[36px] bg-stone-950 px-8 py-10 text-white shadow-xl shadow-stone-950/10 sm:px-10">
            <div className="space-y-8">
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-stone-200 uppercase">
                Baseball memory to book
              </span>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
                  한 시즌의 직관 기록을 한 권의 책으로 남깁니다.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
                  Sweetbook은 경기 기록, 사진, 감상을 모아 시즌북 견적과 주문까지
                  이어주는 야구 팬 기록 제작 흐름입니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/season"
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-stone-950 transition hover:bg-stone-100"
                >
                  데모 흐름 시작
                </Link>
                <Link
                  href="/entries/new"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  새 기록 작성
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
              <div>
                <p className="text-2xl font-semibold">7</p>
                <p className="mt-1 text-xs font-medium tracking-[0.16em] text-stone-400 uppercase">
                  Routes
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold">6</p>
                <p className="mt-1 text-xs font-medium tracking-[0.16em] text-stone-400 uppercase">
                  API flows
                </p>
              </div>
              <div>
                <p className="text-2xl font-semibold">1</p>
                <p className="mt-1 text-xs font-medium tracking-[0.16em] text-stone-400 uppercase">
                  Book order path
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[36px] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-amber-50 to-transparent" />
            <div className="relative flex h-full min-h-[32rem] flex-col justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold tracking-[0.2em] text-stone-400 uppercase">
                  Current flow
                </p>
                <h2 className="max-w-md text-3xl font-semibold tracking-tight text-stone-950">
                  기록 작성부터 시즌북 주문까지 이어지는 MVP
                </h2>
              </div>

              <div className="my-10 grid gap-3">
                {workflowSteps.map((item) => (
                  <div
                    key={item.step}
                    className="grid gap-4 rounded-[28px] border border-stone-200 bg-stone-50/80 px-5 py-5 sm:grid-cols-[4rem_1fr]"
                  >
                    <p className="font-mono text-sm font-semibold text-stone-400">
                      {item.step}
                    </p>
                    <div>
                      <h3 className="text-lg font-semibold text-stone-950">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[28px] bg-stone-950 px-5 py-5 text-white">
                <p className="text-xs font-semibold tracking-[0.18em] text-stone-400 uppercase">
                  Next validation
                </p>
                <p className="mt-3 text-sm leading-6 text-stone-200">
                  백엔드 API가 준비되면 QA 팀이 전체 사용자 흐름을 한 번에 검증할 수
                  있도록 주요 화면은 실제 요청 구조로 연결되어 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 pb-8 md:grid-cols-2 xl:grid-cols-4">
          {routeCards.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="group rounded-[28px] border border-stone-200 bg-white px-5 py-5 shadow-sm transition hover:-translate-y-1 hover:border-stone-300 hover:shadow-md"
            >
              <p className="text-xs font-semibold tracking-[0.18em] text-stone-400 uppercase">
                {route.label}
              </p>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-stone-950">
                {route.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-600">
                {route.description}
              </p>
              <p className="mt-5 text-sm font-semibold text-stone-950">
                열기 <span className="transition group-hover:translate-x-1">→</span>
              </p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
