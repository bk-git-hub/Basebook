import { expect, test } from "@playwright/test";

test("entry create route loads the form shell", async ({ page }) => {
  await page.goto("/entries/new");

  await expect(
    page.getByRole("heading", { name: "POST /entries 생성 흐름" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "새 기록 저장" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "시즌 대시보드로 돌아가기" }),
  ).toBeVisible();
});
