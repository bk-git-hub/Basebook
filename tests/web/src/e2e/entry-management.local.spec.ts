import { expect, test } from "@playwright/test";

import { createEntryViaApi } from "./support/local-stack";

test.describe("entry management", () => {
  test("entry edit flow updates the record and returns to detail", async ({
    page,
    request,
  }) => {
    const entry = await createEntryViaApi(request, {
      highlight: "수정 전 하이라이트",
    });

    await page.goto(`/entries/${entry.id}/edit`);
    await page.getByLabel("한 줄 감상").fill("수정 후 하이라이트");
    await page.getByRole("button", { name: "수정 내용 저장" }).click();

    await page.waitForURL(`**/entries/${entry.id}`);
    await expect(page.getByText("수정 후 하이라이트")).toBeVisible();
  });

  test("entry detail flow can delete a record and return to season notice", async ({
    page,
    request,
  }) => {
    const entry = await createEntryViaApi(request, {
      highlight: "삭제될 기록",
    });

    await page.goto(`/entries/${entry.id}`);
    await page.getByRole("button", { name: "이 기록 삭제하기" }).click();
    await expect(page.getByText("이 일지를 삭제할까요?")).toBeVisible();
    await page.getByRole("button", { name: "삭제하기", exact: true }).click();

    await page.waitForURL(/\/season\?entryDeleted=success/);
    await expect(page.getByText("일지를 삭제했습니다.")).toBeVisible();
  });
});
