import Image from "next/image";
import Link from "next/link";

const primaryNavigation = [
  { href: "/season", label: "대시보드" },
  { href: "/entries/new", label: "새 기록" },
  { href: "/season-book/new", label: "시즌북 제작" },
];

const supportHighlights = [
  {
    label: "기록",
    description: "경기 메모와 감정을 한 흐름에 담아 둡니다.",
  },
  {
    label: "사진",
    description: "직관 사진을 골라 시즌의 장면으로 쌓습니다.",
  },
  {
    label: "주문",
    description: "선택한 기록을 견적과 배송 단계까지 잇습니다.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "경기 하나를 골라 바로 남깁니다",
    description:
      "후보 경기, 사진, 감상 메모를 끊기지 않는 한 화면에서 정리합니다.",
  },
  {
    step: "02",
    title: "시즌에 넣고 싶은 장면만 고릅니다",
    description:
      "쌓아 둔 기록 중 다시 보고 싶은 경기만 추려 시즌북 흐름으로 넘깁니다.",
  },
  {
    step: "03",
    title: "견적 확인 후 주문까지 이어갑니다",
    description:
      "제작 페이지 수와 금액을 보고, 같은 흐름에서 배송 정보까지 마칩니다.",
  },
];

const directRoutes = [
  {
    href: "/entries/new",
    eyebrow: "Start",
    title: "새 직관 기록부터 시작하기",
    description: "기억이 가장 생생할 때 사진과 감상을 바로 남깁니다.",
  },
  {
    href: "/season",
    eyebrow: "Review",
    title: "시즌 기록 모아보기",
    description: "승패 흐름과 최근 직관 기록을 한 화면에서 점검합니다.",
  },
  {
    href: "/season-book/new",
    eyebrow: "Make",
    title: "시즌북 견적 만들기",
    description: "담고 싶은 기록을 고르고 책 제작 흐름으로 넘어갑니다.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff8ef_0%,#fffdf8_36%,#f7f9ff_100%)] text-slate-950">
      <div className="relative isolate">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-7rem] top-[-8rem] h-[22rem] w-[22rem] rounded-full bg-[rgba(255,91,97,0.18)] blur-3xl" />
          <div className="absolute right-[-5rem] top-[6rem] h-[24rem] w-[24rem] rounded-full bg-[rgba(33,77,147,0.16)] blur-3xl" />
          <div className="absolute bottom-[10rem] left-[15%] h-[14rem] w-[14rem] rounded-full bg-[rgba(255,213,168,0.28)] blur-3xl" />
        </div>

        <header className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="inline-flex items-center gap-3 self-start">
            <Image
              src="/basebook.png"
              alt="Basebook"
              width={112}
              height={112}
              className="h-12 w-12 rounded-[16px] object-cover shadow-[0_18px_40px_rgba(15,23,42,0.16)] sm:h-14 sm:w-14"
            />
            <div>
              <p className="text-[0.68rem] font-semibold tracking-[0.28em] text-[#d53342] uppercase">
                fan memory book
              </p>
              <p className="text-lg font-semibold tracking-[0.18em] text-slate-950 uppercase">
                Basebook
              </p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700 sm:gap-6">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-[#163f86]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="px-6 pb-12 pt-4 sm:px-10 sm:pb-16">
          <div className="mx-auto grid min-h-[calc(100svh-7rem)] max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,0.88fr)_minmax(24rem,1.12fr)]">
            <div className="space-y-8">
              <div className="space-y-5">
                <span className="inline-flex items-center rounded-full border border-[#ffb4bb] bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#c42d3c] uppercase shadow-sm">
                  season memory workflow
                </span>
                <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance text-slate-950 sm:text-6xl">
                  직관의 순간을 모아,
                  <br />
                  시즌이 끝나기 전에 책으로 묶습니다.
                </h1>
                <p className="max-w-xl text-base leading-8 text-slate-700 sm:text-lg">
                  Basebook은 경기 기록, 사진, 감상을 흩어 두지 않고 시즌북 제작
                  흐름까지 한 번에 잇는 야구 팬 저널 서비스입니다.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/entries/new"
                  className="inline-flex items-center justify-center rounded-full bg-[#d92f45] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(217,47,69,0.28)] transition hover:-translate-y-0.5 hover:bg-[#c2273c]"
                >
                  새 기록 시작하기
                </Link>
                <Link
                  href="#journey"
                  className="inline-flex items-center justify-center rounded-full border border-[#b7c7e6] bg-white/75 px-5 py-3 text-sm font-semibold text-[#173d7a] transition hover:-translate-y-0.5 hover:border-[#93abd6] hover:bg-white"
                >
                  흐름 먼저 보기
                </Link>
              </div>

              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                {supportHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="border-l-2 border-[rgba(23,61,122,0.16)] pl-4"
                  >
                    <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="group relative w-full max-w-[36rem]">
                <div className="absolute inset-x-12 top-10 h-[68%] rounded-full bg-[rgba(33,77,147,0.22)] blur-3xl" />
                <div className="absolute bottom-2 left-12 right-12 h-28 rounded-full bg-[rgba(255,91,97,0.24)] blur-3xl" />
                <div className="relative rounded-[44px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,245,233,0.82)_42%,rgba(237,243,255,0.9))] p-4 shadow-[0_35px_90px_rgba(15,23,42,0.16)] backdrop-blur">
                  <div className="rounded-[34px] bg-[linear-gradient(135deg,#132d5c,#1c457c_48%,#d53043)] p-[1px]">
                    <div className="rounded-[33px] bg-[#071321] p-3">
                      <Image
                        src="/basebook.png"
                        alt="Basebook brand logo"
                        width={768}
                        height={768}
                        priority
                        className="h-auto w-full rounded-[28px] object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="journey"
          className="mx-auto max-w-7xl px-6 pb-8 sm:px-10 lg:pb-12"
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
            <div className="space-y-5">
              <p className="text-xs font-semibold tracking-[0.22em] text-[#c42d3c] uppercase">
                one flow
              </p>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                기록, 사진, 주문이 따로 놀지 않게 하나의 흐름으로 정리했습니다.
              </h2>
              <p className="max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
                기록 작성 화면에서 시작한 순간이 시즌 대시보드와 시즌북 제작,
                주문 상태 조회까지 자연스럽게 이어지도록 구성했습니다.
              </p>
            </div>

            <div className="overflow-hidden rounded-[34px] border border-white/80 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.1)] backdrop-blur">
              {workflowSteps.map((item, index) => (
                <div
                  key={item.step}
                  className={`grid gap-4 px-6 py-6 sm:grid-cols-[4.5rem_1fr] sm:px-7 ${
                    index < workflowSteps.length - 1
                      ? "border-b border-slate-200/80"
                      : ""
                  }`}
                >
                  <p className="font-mono text-sm font-semibold text-[#173d7a]">
                    {item.step}
                  </p>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:px-10">
          <div className="overflow-hidden rounded-[38px] bg-[linear-gradient(135deg,#10224b,#173d7a_45%,#d53342)] text-white shadow-[0_34px_90px_rgba(15,23,42,0.2)]">
            <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-end">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-white/70 uppercase">
                  next action
                </p>
                <h2 className="max-w-md text-3xl font-semibold tracking-tight text-white">
                  오늘의 기록부터 남기고, 시즌북 제작까지 바로 이어가세요.
                </h2>
                <p className="max-w-lg text-sm leading-7 text-white/80 sm:text-base">
                  랜딩에서는 서비스 흐름만 빠르게 이해하고, 실제 작업은 필요한
                  화면으로 곧장 들어갈 수 있게 정리했습니다.
                </p>
              </div>

              <div className="overflow-hidden rounded-[30px] border border-[rgba(255,255,255,0.12)] bg-white/10 backdrop-blur">
                {directRoutes.map((route, index) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`group flex items-start justify-between gap-4 px-5 py-5 transition hover:bg-white/10 sm:px-6 ${
                      index < directRoutes.length - 1
                        ? "border-b border-[rgba(255,255,255,0.12)]"
                        : ""
                    }`}
                  >
                    <div>
                      <p className="text-[0.72rem] font-semibold tracking-[0.22em] text-white/60 uppercase">
                        {route.eyebrow}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        {route.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/75">
                        {route.description}
                      </p>
                    </div>
                    <span className="mt-1 text-xl text-white/70 transition group-hover:translate-x-1 group-hover:text-white">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
