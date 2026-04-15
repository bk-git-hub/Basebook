import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const featureCards = [
  {
    label: "Record",
    title: "경기 기록을 바로 남깁니다",
    description: "점수, 감상, 사진을 한 경기 단위로 빠르게 정리할 수 있습니다.",
  },
  {
    label: "Collect",
    title: "시즌 장면만 다시 고릅니다",
    description:
      "쌓아 둔 기록 중 다시 보고 싶은 경기만 골라 시즌북 후보로 모읍니다.",
  },
  {
    label: "Make",
    title: "견적부터 주문까지 이어집니다",
    description:
      "고른 기록으로 책 분량을 확인하고, 같은 흐름에서 주문까지 마칩니다.",
  },
];

const journeySteps = [
  {
    step: "01",
    title: "새 기록 남기기",
    description: "경기 직후의 감정과 사진을 가장 먼저 붙잡아 둡니다.",
  },
  {
    step: "02",
    title: "시즌 다시 보기",
    description: "홈과 시즌 화면에서 최근 기록과 직관 흐름을 빠르게 살핍니다.",
  },
  {
    step: "03",
    title: "시즌북 만들기",
    description: "남기고 싶은 장면만 골라 책으로 묶고 주문 상태까지 확인합니다.",
  },
];

const quickLinks = [
  {
    href: "/entries/new",
    eyebrow: "Start",
    title: "새 기록 시작하기",
    description: "가장 최근 경기부터 바로 남기기",
  },
  {
    href: "/",
    eyebrow: "Home",
    title: "홈으로 돌아가기",
    description: "응원 팀과 최근 기록 확인하기",
  },
  {
    href: "/season-book/new",
    eyebrow: "Book",
    title: "시즌북 만들기",
    description: "담고 싶은 기록 골라 견적 보기",
  },
];

export const metadata: Metadata = {
  title: "서비스 소개 | Basebook",
  description: "Basebook의 기록, 시즌 요약, 시즌북 제작 흐름을 소개하는 화면",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-6 text-[#11284f] sm:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-4 py-2.5 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff]"
          >
            홈으로 돌아가기
          </Link>
        </header>

        <section className="rounded-[32px] border border-[#e5ecf6] bg-white p-6 shadow-[0_18px_48px_rgba(17,40,79,0.06)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_18rem] lg:items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full border border-[#dce6f3] bg-[#fbfdff] px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#c42d3c] uppercase">
                  about basebook
                </span>
                <h1 className="text-4xl font-semibold leading-[1.06] tracking-tight text-[#11284f] sm:text-5xl">
                  직관의 순간을 남기고,
                  <br />
                  시즌이 끝나기 전에 책으로 묶습니다.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-[#4e6284] sm:text-lg">
                  Basebook은 경기 기록, 사진, 감상을 흩어두지 않고 시즌북
                  제작까지 자연스럽게 이어 주는 야구 팬 기록 서비스입니다.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/entries/new"
                  className="inline-flex items-center justify-center rounded-full bg-[#11284f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]"
                >
                  새 기록 시작하기
                </Link>
                <Link
                  href="/season-book/new"
                  className="inline-flex items-center justify-center rounded-full border border-[#11284f] bg-white px-5 py-3 text-sm font-semibold text-[#11284f] transition hover:bg-[#f8fbff]"
                >
                  시즌북 만들기
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#e5ecf6] bg-[#fbfdff] p-4">
              <div className="rounded-[22px] border border-[#edf2f8] bg-white p-4">
                <Image
                  src="/basebook.png"
                  alt="Basebook"
                  width={480}
                  height={480}
                  priority
                  className="h-auto w-full rounded-[18px] bg-white object-contain"
                />
              </div>
              <div className="mt-4 grid gap-2.5">
                <div className="rounded-[18px] border border-[#e5ecf6] bg-white px-4 py-3 text-sm text-[#5a6f91]">
                  경기마다 감정과 사진을 함께 남기기
                </div>
                <div className="rounded-[18px] border border-[#e5ecf6] bg-white px-4 py-3 text-sm text-[#5a6f91]">
                  시즌 흐름을 홈과 시즌 화면에서 다시 보기
                </div>
                <div className="rounded-[18px] border border-[#e5ecf6] bg-white px-4 py-3 text-sm text-[#5a6f91]">
                  고른 기록으로 시즌북 제작과 주문 이어가기
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {featureCards.map((card) => (
            <article
              key={card.label}
              className="rounded-[28px] border border-[#e5ecf6] bg-white p-6 shadow-[0_16px_40px_rgba(17,40,79,0.05)]"
            >
              <p className="text-xs font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
                {card.label}
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-[#11284f]">
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#5a6f91]">
                {card.description}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-[30px] border border-[#e5ecf6] bg-white p-6 shadow-[0_18px_48px_rgba(17,40,79,0.05)] sm:p-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
              journey
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#11284f]">
              Basebook을 쓰는 흐름
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-[#5a6f91]">
              기록을 남긴 뒤 시즌을 돌아보고, 필요한 장면만 골라 시즌북으로
              이어집니다.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {journeySteps.map((item) => (
              <article
                key={item.step}
                className="rounded-[24px] border border-[#e5ecf6] bg-[#fbfdff] px-5 py-5"
              >
                <p className="font-mono text-sm font-semibold text-[#173d7a]">
                  {item.step}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-[#11284f]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5a6f91]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-[#e5ecf6] bg-white p-6 shadow-[0_18px_48px_rgba(17,40,79,0.05)] sm:p-8">
          <div className="flex flex-col gap-3 border-b border-[#edf2f8] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#c42d3c] uppercase">
                next
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#11284f] sm:text-3xl">
                바로 시작할 수 있는 화면
              </h2>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[26px] border border-[#e5ecf6] bg-[#fbfdff]">
            {quickLinks.map((route, index) => (
              <Link
                key={route.href}
                href={route.href}
                className={`group flex items-start justify-between gap-4 px-5 py-5 transition hover:bg-white sm:px-6 ${
                  index < quickLinks.length - 1
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
        </section>
      </div>
    </main>
  );
}
