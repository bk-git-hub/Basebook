import type { Metadata } from "next";

import { EntryCreateForm } from "@/components/entry-create-form";

export const metadata: Metadata = {
  title: "경기 기록 작성 | Basebook",
  description: "경기와 사진, 감상을 묶어 새 기록을 남기는 화면",
};

export default function EntryCreatePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-6 text-[#11284f] sm:px-10">
      <div className="mx-auto max-w-6xl">
        <EntryCreateForm />
      </div>
    </main>
  );
}
