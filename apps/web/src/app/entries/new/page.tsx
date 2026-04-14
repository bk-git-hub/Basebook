import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { EntryCreateForm } from "@/components/entry-create-form";

export const metadata: Metadata = {
  title: "직관 기록 작성 | Basebook",
  description: "경기와 사진, 감상을 묶어 새 직관 기록을 남기는 화면",
};

export default function EntryCreatePage() {
  return (
    <AppShell
      activeSection="entries"
      title="새 직관 기록"
      description="경기 후보 조회, 사진 업로드, 감상 작성까지 한 번에 이어서 저장합니다."
    >
      <EntryCreateForm />
    </AppShell>
  );
}
