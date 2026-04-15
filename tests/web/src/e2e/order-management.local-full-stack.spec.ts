import { expect, test } from "@playwright/test";

import { createOrderViaApi } from "./support/local-stack";

test.describe("order management", () => {
  test("order history route shows empty and populated states end-to-end", async ({
    page,
    request,
  }) => {
    await page.goto("/order");
    await expect(
      page.getByText("아직 주문한 시즌북이 없습니다"),
    ).toBeVisible();

    const { estimate } = await createOrderViaApi(request);

    await page.goto("/order");

    await expect(
      page.getByRole("heading", { name: estimate.title }),
    ).toBeVisible();
    await expect(page.getByText("주문 완료").first()).toBeVisible();
    await expect(page.getByText("주문 확인").first()).toBeVisible();

    await page.locator(`a[href="/order/${estimate.projectId}/status"]`).click();
    await page.waitForURL(`**/order/${estimate.projectId}/status`);
    await expect(page.getByRole("heading", { name: "주문 정보" })).toBeVisible();
  });

  test("order status route updates shipping information in the browser flow", async ({
    page,
    request,
  }) => {
    const { estimate, shipping } = await createOrderViaApi(request, {
      recipientName: "기존 수령인",
      address1: "서울특별시 강남구 기존주소 1",
    });

    await page.goto(`/order/${estimate.projectId}/status`);

    await expect(page.getByText(shipping.recipientName)).toBeVisible();
    await page.getByRole("button", { name: "배송지 수정" }).click();
    await page.getByLabel("수령인 이름").fill("수정된 수령인");
    await page.getByLabel("기본 주소").fill("서울특별시 서초구 변경주소 2");
    await page.getByLabel("배송 메모").fill("문 앞에 놓아 주세요.");

    const shippingResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/season-books/${estimate.projectId}/shipping`) &&
        response.request().method() === "PATCH",
    );

    await page.getByRole("button", { name: "배송지 저장" }).click();

    const shippingResponse = await shippingResponsePromise;
    expect(shippingResponse.ok()).toBeTruthy();

    await expect(page.getByText("배송지 정보를 업데이트했습니다.")).toBeVisible();
    await expect(page.getByText("수정된 수령인")).toBeVisible();
    await expect(page.getByText("서울특별시 서초구 변경주소 2")).toBeVisible();
    await expect(page.getByText("문 앞에 놓아 주세요.")).toBeVisible();
  });

  test("order status route supports local cancellation flow", async ({
    page,
    request,
  }) => {
    const { estimate } = await createOrderViaApi(request);

    await page.goto(`/order/${estimate.projectId}/status`);

    const cancelResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/season-books/${estimate.projectId}/cancel`) &&
        response.request().method() === "POST",
    );

    await page.getByRole("button", { name: "주문 바로 취소" }).click();

    const cancelResponse = await cancelResponsePromise;
    expect(cancelResponse.ok()).toBeTruthy();

    await expect(
      page.getByRole("heading", { name: "주문 취소와 환불 처리가 반영되었습니다" }),
    ).toBeVisible();
    await expect(page.getByText("취소 및 환불 처리").first()).toBeVisible();
    await expect(page.getByText("주문 완료").first()).toBeVisible();
  });
});
