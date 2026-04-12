import type { Metadata } from "next";

import { EntryCreateForm } from "@/components/entry-create-form";

export const metadata: Metadata = {
  title: "직관 기록 작성 | Sweetbook",
  description: "경기와 사진, 감상을 묶어 새 직관 기록을 남기는 화면",
};

export default function EntryCreatePage() {
  return (
    <main className="min-h-screen bg-stone-100 px-6 py-10 text-stone-950 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <EntryCreateForm />
      </div>
    </main>
  );
}
