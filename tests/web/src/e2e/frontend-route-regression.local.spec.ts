import { expect, test } from "@playwright/test";

import {
  buildOrderPageUrl,
  createEntryViaApi,
  estimateSeasonBookViaApi,
} from "./support/local-stack";

test.describe("frontend route regression", () => {
  test("home route reads like the user home", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "서비스 알아보기" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "직관 승률" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "최근에 남긴 일지" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "새 일지 남기기" })).toBeVisible();
  });

  test("about route presents the service introduction", async ({ page }) => {
    await page.goto("/about");

    await expect(
      page.getByRole("heading", {
        name: /직관의 순간을 남기고,\s*시즌이 끝나기 전에 책으로 묶습니다\./,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "새 기록 시작하기", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "시즌북 만들기", exact: true }).first(),
    ).toBeVisible();
  });

  test("season route renders the latest season summary", async ({ page }) => {
    await page.goto("/season");

    await expect(page.getByText("직관 승률").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "전체 기록" })).toBeVisible();
    await expect(page.getByRole("link", { name: "새 일지 남기기" })).toBeVisible();
  });

  test("entry detail route renders a created record", async ({ page, request }) => {
    const entry = await createEntryViaApi(request, {
      highlight: "라우트 회귀 상세 확인",
      includePhoto: true,
    });

    await page.goto(`/entries/${entry.id}`);

    await expect(page.getByText("라우트 회귀 상세 확인")).toBeVisible();
    await expect(page.getByRole("link", { name: "이 기록 수정하기" })).toBeVisible();
    await expect(page.getByRole("button", { name: "이 기록 삭제하기" })).toBeVisible();
    await expect(page.getByRole("link", { name: "원본 열기" })).toBeVisible();
  });

  test("entry detail not-found route renders the missing-entry state", async ({
    page,
  }) => {
    await page.goto("/entries/missing-entry-id");

    await expect(page.getByText("이 기록을 찾지 못했습니다")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "시즌 대시보드로 이동" }),
    ).toBeVisible();
  });

  test("entry edit route renders the edit form for a created record", async ({
    page,
    request,
  }) => {
    const entry = await createEntryViaApi(request, {
      highlight: "라우트 회귀 수정 확인",
    });

    await page.goto(`/entries/${entry.id}/edit`);

    await expect(page.getByLabel("한 줄 감상")).toHaveValue("라우트 회귀 수정 확인");
    await expect(page.getByRole("button", { name: "수정 내용 저장" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "상세 화면으로 돌아가기" }),
    ).toBeVisible();
  });

  test("season-book builder route renders the composition shell", async ({
    page,
  }) => {
    await page.goto("/season-book/new");

    await expect(
      page.getByRole("heading", { name: "담을 기록을 고르고 견적까지 이어가세요" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "전체 선택" })).toBeVisible();
    await expect(page.getByLabel("시즌북 제목")).toBeVisible();
    await expect(page.getByRole("button", { name: "시즌북 견적 생성" })).toBeVisible();
  });

  test("order form route renders estimate summary for a created project", async ({
    page,
    request,
  }) => {
    const estimate = await estimateSeasonBookViaApi(request);

    await page.goto(buildOrderPageUrl(estimate));

    await expect(page.getByText("배송 정보")).toBeVisible();
    await expect(page.getByText("주문 확인")).toBeVisible();
    await expect(page.getByText(`${estimate.pageCount}p`)).toBeVisible();
    await expect(page.getByRole("button", { name: "주문하기" })).toBeVisible();
  });
});
