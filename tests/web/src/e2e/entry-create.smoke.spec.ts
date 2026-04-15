import { expect, test } from "@playwright/test";

test("entry create route loads the form shell", async ({ page }) => {
  await page.goto("/entries/new");

  await expect(
    page.getByRole("heading", { name: "오늘의 직관 기록을 남겨보세요" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "새 기록 저장" }),
  ).toBeVisible();
  await expect(page.getByLabel("결과")).toHaveValue("UNKNOWN");
  await expect(
    page.getByRole("link", { name: "홈으로 돌아가기" }),
  ).toBeVisible();
});

test("entry create route reflects the redesigned mobile controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/entries/new");

  const favoriteTeamPicker = page
    .locator("fieldset")
    .filter({ has: page.getByText("응원 팀") })
    .first();
  const opponentTeamPicker = page
    .locator("fieldset")
    .filter({ has: page.getByText("상대 팀") })
    .first();

  await expect(favoriteTeamPicker.getByRole("combobox")).toBeVisible();
  await expect(opponentTeamPicker.getByRole("combobox")).toBeVisible();
  await expect(
    opponentTeamPicker.locator('option[value="DOOSAN"]'),
  ).toBeDisabled();
  await expect(page.getByLabel("경기장")).toBeVisible();

  await page.getByLabel("관람 형태").selectOption("TV");

  await expect(
    page.getByRole("heading", { name: "오늘의 경기 기록을 남겨보세요" }),
  ).toBeVisible();
  await expect(page.getByLabel("경기장")).toHaveCount(0);
  await expect(page.getByLabel("좌석")).toHaveCount(0);
});
