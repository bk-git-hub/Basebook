import { expect, test } from "@playwright/test";

const pngBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn0X3sAAAAASUVORK5CYII=",
  "base64",
);

test("creates a new entry through the local-only full-stack QA environment", async ({
  page,
  request,
}) => {
  const suffix = Date.now();
  const highlight = `로컬 풀스택 생성 검증 ${suffix}`;
  const apiBaseUrl =
    process.env.PLAYWRIGHT_API_BASE_URL || "http://localhost:4000";

  await page.goto("/entries/new");

  await page.getByLabel("관람 날짜").fill("2026-04-15");
  await page.getByLabel("경기장").selectOption("잠실야구장");
  await page.getByLabel("우리 팀 점수").fill("4");
  await page.getByLabel("상대 팀 점수").fill("2");
  await page.getByLabel("오늘의 선수").fill("홍길동");
  await page.getByLabel("한 줄 감상").fill(highlight);

  const uploadResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/uploads/image") &&
      response.request().method() === "POST",
  );

  await page.locator('input[type="file"]').setInputFiles({
    buffer: pngBuffer,
    mimeType: "image/png",
    name: `qa-local-${suffix}.png`,
  });

  const uploadResponse = await uploadResponsePromise;
  expect(uploadResponse.status()).toBe(201);

  const uploadPayload = (await uploadResponse.json()) as {
    asset: { url: string };
  };
  const uploadedUrl = uploadPayload.asset.url;

  expect(uploadedUrl.startsWith(`${apiBaseUrl}/uploads/local/`)).toBeTruthy();
  await expect(
    page.getByText("1개의 사진을 업로드했습니다. 저장하면 이번 기록에 함께 담깁니다."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "업로드 결과 열기" }),
  ).toHaveAttribute("href", uploadedUrl);

  const uploadedAssetResponse = await request.get(uploadedUrl);
  expect(uploadedAssetResponse.ok()).toBeTruthy();
  expect(uploadedAssetResponse.headers()["content-type"]).toContain("image/");
  expect((await uploadedAssetResponse.body()).byteLength).toBeGreaterThan(0);

  const createResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith("/entries") &&
      response.request().method() === "POST",
  );

  await page.getByRole("button", { name: "새 기록 저장" }).click();

  const createResponse = await createResponsePromise;
  expect(createResponse.status()).toBe(201);

  const createPayload = (await createResponse.json()) as {
    entry: { id: string; photos: Array<{ url: string }> };
  };

  expect(createPayload.entry.photos).toHaveLength(1);
  expect(createPayload.entry.photos[0]?.url).toBe(uploadedUrl);

  await page.waitForURL(/\/entries\/[^/]+$/);
  await expect(page.getByText(highlight)).toBeVisible();
  await expect(page.getByRole("link", { name: "원본 열기" })).toHaveAttribute(
    "href",
    uploadedUrl,
  );

  const entryResponse = await request.get(
    `${apiBaseUrl}/entries/${createPayload.entry.id}`,
  );

  expect(entryResponse.ok()).toBeTruthy();

  const entryPayload = (await entryResponse.json()) as {
    entry: { highlight: string; photos: Array<{ url: string }> };
  };

  expect(entryPayload.entry.highlight).toBe(highlight);
  expect(entryPayload.entry.photos[0]?.url).toBe(uploadedUrl);
});
