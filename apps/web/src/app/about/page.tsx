import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const primaryNavigation = [
  { href: "/", label: "홈" },
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
    href: "/",
    eyebrow: "Home",
    title: "홈에서 시즌 요약 보기",
    description: "응원 팀과 직관 승률, 최근 기록을 바로 확인합니다.",
  },
  {
    href: "/season-book/new",
    eyebrow: "Make",
    title: "시즌북 견적 만들기",
    description: "담고 싶은 기록을 고르고 책 제작 흐름으로 넘어갑니다.",
  },
];

export const metadata: Metadata = {
  title: "서비스 소개 | Basebook",
  description: "Basebook이 기록, 사진, 시즌북 제작 흐름을 어떻게 잇는지 소개하는 화면",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-[#11284f]">
      <div>
        <header className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="inline-flex items-center gap-3 self-start">
            <Image
              src="/basebook.png"
              alt="Basebook"
              width={112}
              height={112}
              className="h-12 w-12 rounded-[16px] bg-white object-cover sm:h-14 sm:w-14"
            />
            <div>
              <p className="text-[0.68rem] font-semibold tracking-[0.28em] text-[#d53342] uppercase">
                fan memory book
              </p>
              <p className="text-lg font-semibold tracking-[0.18em] text-[#11284f] uppercase">
                Basebook
              </p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#33486c] sm:gap-6">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-[#11284f]"
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
                <span className="inline-flex items-center rounded-full border border-[#d7e3f2] bg-white px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
                  about the service
                </span>
                <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance text-[#11284f] sm:text-6xl">
                  직관의 순간을 모아,
                  <br />
                  시즌이 끝나기 전에 책으로 묶습니다.
                </h1>
                <p className="max-w-xl text-base leading-8 text-[#4e6284] sm:text-lg">
                  Basebook은 경기 기록, 사진, 감상을 흩어 두지 않고 시즌북 제작
                  흐름까지 한 번에 잇는 야구 팬 저널 서비스입니다.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0b1d3b]"
                >
                  홈에서 시즌 보기
                </Link>
                <Link
                  href="/entries/new"
                  className="inline-flex items-center justify-center rounded-full border border-[#d0dced] bg-white px-5 py-3 text-sm font-semibold text-[#11284f] transition hover:-translate-y-0.5 hover:border-[#aabbd6]"
                >
                  새 기록 시작하기
                </Link>
              </div>

              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                {supportHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="border-l-2 border-[#d7e3f2] pl-4"
                  >
                    <p className="text-sm font-semibold text-[#11284f]">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-[37rem] rounded-[36px] border border-[#d7e3f2] bg-white p-5 shadow-[0_24px_60px_rgba(17,40,79,0.08)]">
                <div className="rounded-[28px] border border-[#e6eef8] bg-white p-4">
                  <Image
                    src="/basebook.png"
                    alt="Basebook brand logo"
                    width={768}
                    height={768}
                    priority
                    className="h-auto w-full rounded-[24px] bg-white object-contain"
                  />
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
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-[#11284f] sm:text-4xl">
                기록, 사진, 주문이 따로 놀지 않게 하나의 흐름으로 정리했습니다.
              </h2>
              <p className="max-w-lg text-sm leading-7 text-[#5a6f91] sm:text-base">
                기록 작성 화면에서 시작한 순간이 시즌 대시보드와 시즌북 제작,
                주문 상태 조회까지 자연스럽게 이어지도록 구성했습니다.
              </p>
            </div>

            <div className="overflow-hidden rounded-[34px] border border-[#d7e3f2] bg-white shadow-[0_18px_48px_rgba(17,40,79,0.06)]">
              {workflowSteps.map((item, index) => (
                <div
                  key={item.step}
                  className={`grid gap-4 px-6 py-6 sm:grid-cols-[4.5rem_1fr] sm:px-7 ${
                    index < workflowSteps.length - 1
                      ? "border-b border-[#e4ebf4]"
                      : ""
                  }`}
                >
                  <p className="font-mono text-sm font-semibold text-[#173d7a]">
                    {item.step}
                  </p>
                  <div>
                    <h3 className="text-lg font-semibold text-[#11284f]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:px-10">
          <div className="overflow-hidden rounded-[38px] border border-[#d7e3f2] bg-white shadow-[0_18px_48px_rgba(17,40,79,0.06)]">
            <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-end">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.22em] text-[#c42d3c] uppercase">
                  next action
                </p>
                <h2 className="max-w-md text-3xl font-semibold tracking-tight text-[#11284f]">
                  이제 홈에서 시즌 요약을 확인하고, 필요한 작업으로 바로 이어가세요.
                </h2>
                <p className="max-w-lg text-sm leading-7 text-[#5a6f91] sm:text-base">
                  서비스 소개는 여기서 끝내고, 실제 사용 흐름은 홈과 기록 작성
                  화면에서 바로 시작할 수 있도록 분리했습니다.
                </p>
              </div>

              <div className="overflow-hidden rounded-[30px] border border-[#d7e3f2] bg-white">
                {directRoutes.map((route, index) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`group flex items-start justify-between gap-4 px-5 py-5 transition hover:bg-[#f7faff] sm:px-6 ${
                      index < directRoutes.length - 1
                        ? "border-b border-[#e4ebf4]"
                        : ""
                    }`}
                  >
                    <div>
                      <p className="text-[0.72rem] font-semibold tracking-[0.22em] text-[#c42d3c] uppercase">
                        {route.eyebrow}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-[#11284f]">
                        {route.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
                        {route.description}
                      </p>
                    </div>
                    <span className="mt-1 text-xl text-[#8ca0c2] transition group-hover:translate-x-1 group-hover:text-[#11284f]">
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
