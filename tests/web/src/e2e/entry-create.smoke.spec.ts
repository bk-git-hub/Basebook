import { expect, test } from "@playwright/test";

test("entry create route loads the form shell", async ({ page }) => {
  await page.goto("/entries/new");

  await expect(
    page.getByRole("heading", { name: "오늘의 직관 기록을 남겨보세요" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "새 기록 저장" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "시즌 대시보드로 돌아가기" }),
  ).toBeVisible();
});
