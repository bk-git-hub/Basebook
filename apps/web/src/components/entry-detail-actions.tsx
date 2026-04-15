"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import { deleteEntry } from "@/lib/api/entries";
import { ApiClientError } from "@/lib/api/http";

const PRIMARY_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-full bg-[#11284f] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b1d3b]";

const DANGER_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-full bg-rose-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-rose-300";

const SECONDARY_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-full border border-[#d4ddeb] bg-white px-5 py-2.5 text-sm font-semibold text-[#11284f] transition hover:border-[#aebfd8] hover:bg-[#f8fbff] disabled:cursor-not-allowed disabled:text-[#8da1be]";

type EntryDeleteResult = "success" | "missing";

function buildSeasonRedirect(result: EntryDeleteResult) {
  const params = new URLSearchParams({ entryDeleted: result });
  return `/season?${params.toString()}`;
}

type EntryDetailActionsProps = {
  entryId: string;
};

export function EntryDetailActions({ entryId }: EntryDetailActionsProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openDialog() {
    if (isDeleting) {
      return;
    }

    setDeleteError(null);
    setIsDialogOpen(true);
  }

  function closeDialog() {
    if (isDeleting) {
      return;
    }

    setDeleteError(null);
    setIsDialogOpen(false);
  }

  async function handleDelete() {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteEntry(entryId);
      startTransition(() => {
        router.push(buildSeasonRedirect("success"));
        router.refresh();
      });
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 404) {
        startTransition(() => {
          router.push(buildSeasonRedirect("missing"));
          router.refresh();
        });
        return;
      }

      if (error instanceof ApiClientError) {
        setDeleteError(error.message);
      } else {
        setDeleteError(
          "예상하지 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 xl:justify-end">
        <Link href={`/entries/${entryId}/edit`} className={PRIMARY_BUTTON_CLASS}>
          이 기록 수정하기
        </Link>
        <button type="button" onClick={openDialog} className={DANGER_BUTTON_CLASS}>
          이 기록 삭제하기
        </button>
      </div>

      {isDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#11284f]/35 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="entry-delete-dialog-title"
        >
          <div className="w-full max-w-md rounded-[28px] border border-rose-200 bg-white p-6 shadow-[0_24px_70px_rgba(17,40,79,0.22)] sm:p-7">
            <div className="space-y-3">
              <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-rose-700 uppercase">
                Delete Entry
              </span>
              <h2
                id="entry-delete-dialog-title"
                className="text-2xl font-semibold tracking-tight text-[#11284f]"
              >
                이 일지를 삭제할까요?
              </h2>
              <p className="text-sm leading-7 text-[#5a6f91]">
                삭제하면 이 기록과 연결된 사진 정보가 함께 정리됩니다. 삭제한
                뒤에는 시즌 기록 화면으로 돌아갑니다.
              </p>
            </div>

            {deleteError ? (
              <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
                {deleteError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDialog}
                disabled={isDeleting}
                className={SECONDARY_BUTTON_CLASS}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={DANGER_BUTTON_CLASS}
              >
                {isDeleting ? "삭제 중..." : "삭제하기"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
