import { expect, test } from "@playwright/test";

test.describe("season book failures", () => {
  test("season-book builder blocks estimate creation when required inputs are missing", async ({
    page,
  }) => {
    await page.goto("/season-book/new");

    await page.getByLabel("시즌북 제목").fill("");
    await page.getByRole("button", { name: "시즌북 견적 생성" }).click();

    await expect(
      page.getByText("시즌북에 넣을 기록을 하나 이상 선택해 주세요."),
    ).toBeVisible();
    await expect(page.getByText("시즌북 제목을 입력해 주세요.")).toBeVisible();
    await expect(
      page.getByText(
        "커버 이미지를 업로드하거나 선택 기록의 첫 사진을 커버로 사용해 주세요.",
      ),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/season-book\/new$/);
  });

  test("season-book builder shows a cover helper error when no photo can be suggested", async ({
    page,
  }) => {
    await page.goto("/season-book/new");
    await page
      .getByRole("button", { name: "선택 기록의 첫 사진을 커버로 사용" })
      .click();

    await expect(
      page.getByText(
        "선택한 기록에 첨부 사진이 없습니다. 이미지를 업로드하거나 직접 URL을 입력해 주세요.",
      ),
    ).toBeVisible();
  });

  test("order route warns when the estimate summary is missing", async ({
    page,
  }) => {
    await page.goto("/order/missing-project");

    await expect(page.getByText("견적 정보를 다시 불러와 주세요.")).toBeVisible();
    await expect(page.getByRole("button", { name: "주문하기" })).toBeVisible();
  });

  test("order status route renders the failure state for an unknown project", async ({
    page,
  }) => {
    await page.goto("/order/missing-project/status");

    await expect(
      page.getByText("주문 진행 상태를 불러오지 못했습니다"),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "다시 시도하기" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "주문 화면으로 돌아가기" }),
    ).toHaveAttribute("href", "/order/missing-project");
  });
});
