import Link from "next/link";

import { AppShell } from "@/components/app-shell";

export default function EntryNotFound() {
  return (
    <AppShell
      activeSection="entries"
      title="직관 기록 상세"
      description="저장된 기록을 다시 열거나 다른 기록 흐름으로 이동할 수 있습니다."
    >
      <div className="max-w-3xl rounded-[28px] border border-stone-200 bg-white p-8 shadow-sm">
        <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-stone-500 uppercase">
          Entry Detail
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
          이 기록을 찾지 못했습니다
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          해당 주소의 기록이 없거나 더 이상 열 수 없습니다. 대시보드에서
          존재하는 기록을 다시 선택해 주세요.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/season"
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            시즌 대시보드로 이동
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
