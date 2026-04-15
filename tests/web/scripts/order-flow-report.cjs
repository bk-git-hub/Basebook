const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const { chromium } = require("@playwright/test");

const repoRoot = path.resolve(__dirname, "../../..");
const webRoot = path.resolve(__dirname, "..");
const outputDir = path.join(webRoot, "test-results", "order-flow-report");
const apiPrismaDir = path.resolve(repoRoot, "apps/api/prisma");
const baseWebUrl = "http://127.0.0.1:3000";
const baseApiUrl = "http://127.0.0.1:4000";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const localDatabaseUrl = `file:${path
  .relative(apiPrismaDir, path.join(outputDir, "order-flow.db"))
  .replace(/\\/g, "/")}`;
const localOnlyEnv = {
  ...process.env,
  DATABASE_URL: localDatabaseUrl,
  NEXT_PUBLIC_API_BASE_URL: baseApiUrl,
  PORT: "4000",
  SWEETBOOK_ESTIMATE_MODE: "local",
  SWEETBOOK_ORDER_MODE: "local",
  UPLOAD_STORAGE_DRIVER: "local",
};
const pngBuffer = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn0X3sAAAAASUVORK5CYII=",
  "base64",
);

function ensureOutputDir() {
  fs.rmSync(outputDir, { recursive: true, force: true });
  fs.mkdirSync(outputDir, { recursive: true });
}

function logFile(name) {
  return path.join(outputDir, name);
}

function spawnLogged(command, args, name) {
  const spawnTarget =
    process.platform === "win32" && /\.cmd$/iu.test(command)
      ? { command: "cmd.exe", args: ["/d", "/c", command, ...args] }
      : { command, args };
  const child = spawn(spawnTarget.command, spawnTarget.args, {
    cwd: repoRoot,
    env: localOnlyEnv,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  const stream = fs.createWriteStream(logFile(`${name}.log`), { flags: "a" });

  child.stdout.pipe(stream);
  child.stderr.pipe(stream);

  return { child, stream };
}

function run(command, args, name) {
  return new Promise((resolve, reject) => {
    const { child, stream } = spawnLogged(command, args, name);

    child.on("error", (error) => {
      stream.end();
      reject(error);
    });
    child.on("exit", (code) => {
      stream.end();
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${name} failed with exit code ${code}`));
    });
  });
}

async function canFetch(url) {
  try {
    const response = await fetch(url, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitFor(url, label, timeoutMs = 90000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await canFetch(url)) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`${label} did not become ready at ${url}`);
}

function killProcess(processHandle) {
  if (!processHandle || processHandle.killed) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, 5000);

    processHandle.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });

    if (process.platform === "win32") {
      const killer = spawn("taskkill.exe", ["/PID", String(processHandle.pid), "/T", "/F"], {
        stdio: "ignore",
      });
      killer.on("error", () => {
        processHandle.kill("SIGTERM");
      });
      return;
    }

    processHandle.kill("SIGTERM");
  });
}

function field(page, labelText) {
  return page
    .locator("label")
    .filter({ hasText: labelText })
    .locator("input, textarea")
    .first();
}

function toDataUri(filePath) {
  const extension = path.extname(filePath).slice(1) || "png";
  const base64 = fs.readFileSync(filePath).toString("base64");
  return `data:image/${extension};base64,${base64}`;
}

function writeMarkdownReport(result) {
  const lines = [
    "# Frontend-Backend Order Flow QA Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Scope",
    "",
    "- Browser flow: `/season-book/new` -> local cover upload -> estimate creation -> `/order/[projectId]` -> shipping form -> order status",
    "- Backend endpoints observed: `POST /uploads/image`, `POST /season-books/estimate`, `POST /season-books/order`",
    "- Secret handling: API keys and raw uploaded asset URLs are intentionally omitted.",
    "",
    "## Result",
    "",
    `- Overall: ${result.ok ? "PASS" : "FAIL"}`,
    `- Local cover URL accepted: ${result.uploadedCoverIsLocal ? "yes" : "no"}`,
    `- Estimate response status: ${result.estimateStatus}`,
    `- Order response status: ${result.orderStatus}`,
    `- Final order status visible: ${result.finalOrderStatus}`,
    `- Final project status visible: ${result.finalProjectStatus}`,
    `- Final page URL: ${result.finalUrl}`,
    "",
    "## Steps And Evidence",
    "",
  ];

  for (const screenshot of result.screenshots) {
    lines.push(`### ${screenshot.title}`);
    lines.push("");
    lines.push(screenshot.description);
    lines.push("");
    lines.push(`![${screenshot.title}](${path.relative(outputDir, screenshot.path).replace(/\\/g, "/")})`);
    lines.push("");
  }

  fs.writeFileSync(path.join(outputDir, "order-flow-report.md"), `${lines.join("\n")}\n`);
}

async function writePdfReport(result) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const screenshotSections = result.screenshots
    .map(
      (screenshot) => `
        <section>
          <h2>${screenshot.title}</h2>
          <p>${screenshot.description}</p>
          <img src="${toDataUri(screenshot.path)}" alt="${screenshot.title}" />
        </section>
      `,
    )
    .join("\n");
  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Frontend-Backend Order Flow QA Report</title>
        <style>
          body {
            color: #1c1917;
            font-family: "Segoe UI", sans-serif;
            margin: 32px;
          }
          h1, h2 {
            color: #0c0a09;
          }
          .summary {
            background: #f5f5f4;
            border: 1px solid #e7e5e4;
            border-radius: 18px;
            padding: 18px 22px;
          }
          section {
            break-inside: avoid;
            margin-top: 28px;
          }
          img {
            border: 1px solid #d6d3d1;
            border-radius: 14px;
            max-width: 100%;
          }
          code {
            background: #f5f5f4;
            border-radius: 6px;
            padding: 2px 5px;
          }
        </style>
      </head>
      <body>
        <h1>Frontend-Backend Order Flow QA Report</h1>
        <p>Generated: ${new Date().toISOString()}</p>
        <div class="summary">
          <p><strong>Overall:</strong> ${result.ok ? "PASS" : "FAIL"}</p>
          <p><strong>Scope:</strong> <code>/season-book/new</code> -> local cover upload -> estimate -> <code>/order/[projectId]</code> -> order status</p>
          <p><strong>Estimate status:</strong> ${result.estimateStatus}</p>
          <p><strong>Order status:</strong> ${result.orderStatus}</p>
          <p><strong>Final UI status:</strong> ${result.finalOrderStatus} / ${result.finalProjectStatus}</p>
          <p><strong>Local cover URL accepted:</strong> ${result.uploadedCoverIsLocal ? "yes" : "no"}</p>
          <p><strong>Secret handling:</strong> API keys and raw uploaded asset URLs are intentionally omitted.</p>
        </div>
        ${screenshotSections}
      </body>
    </html>
  `;

  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({
    format: "A4",
    path: path.join(outputDir, "order-flow-report.pdf"),
    printBackground: true,
    margin: { top: "16mm", right: "12mm", bottom: "16mm", left: "12mm" },
  });
  await browser.close();
}

async function runBrowserFlow() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const apiResponses = [];
  const screenshots = [
    {
      title: "Step 1 - Season Book Builder Loaded",
      description: "Opened `/season-book/new` and verified the record-selection and builder form entry point.",
      path: path.join(outputDir, "01-season-book-new.png"),
    },
    {
      title: "Step 2 - Local Cover Uploaded",
      description: "Uploaded a cover image through the browser UI and confirmed that the preview now points to a local API-hosted asset.",
      path: path.join(outputDir, "02-cover-uploaded.png"),
    },
    {
      title: "Step 3 - Order Form With Estimate Summary",
      description: "Created the estimate and verified that the flow redirected into `/order/[projectId]` with the estimate summary attached.",
      path: path.join(outputDir, "03-order-form.png"),
    },
    {
      title: "Step 4 - Order Status Updated",
      description: "Submitted shipping information and verified the order status page with the updated local project and order states.",
      path: path.join(outputDir, "04-order-status.png"),
    },
  ];

  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/season-books/estimate") || url.includes("/season-books/order")) {
      apiResponses.push({ url: url.replace(/\?.*$/u, ""), status: response.status() });
    }
  });

  try {
    await page.goto(`${baseWebUrl}/season-book/new`, { waitUntil: "networkidle", timeout: 60000 });
    await page.screenshot({ path: screenshots[0].path, fullPage: true });
    await page.getByRole("button", { name: "전체 선택" }).click();
    await field(page, "시즌북 제목").fill(`QA 주문 흐름 ${Date.now()}`);
    await page
      .locator("label")
      .filter({ hasText: "소개문" })
      .locator("textarea")
      .fill("로컬 업로드 커버 이미지와 선택 기록으로 시즌북 견적을 만든 뒤 주문 상태 화면까지 이어지는 통합 QA입니다.");

    const uploadResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/uploads/image") &&
        response.request().method() === "POST",
    );

    await page.locator('input[type="file"]').setInputFiles({
      buffer: pngBuffer,
      mimeType: "image/png",
      name: "qa-cover.png",
    });

    const uploadResponse = await uploadResponsePromise;

    if (uploadResponse.status() !== 201) {
      throw new Error(`Cover upload failed with HTTP ${uploadResponse.status()}`);
    }

    await page
      .getByText(/업로드가 완료되어 커버 이미지로 적용했습니다\./)
      .waitFor({ timeout: 30000 });

    const uploadedCoverUrl = await page
      .getByAltText("시즌북 커버 미리보기")
      .getAttribute("src");

    if (!uploadedCoverUrl) {
      throw new Error("Cover preview did not expose a source URL");
    }

    const coverHost = new URL(uploadedCoverUrl).hostname;
    const uploadedCoverIsLocal = ["localhost", "127.0.0.1", "0.0.0.0"].includes(
      coverHost,
    );

    if (!uploadedCoverIsLocal) {
      throw new Error(
        `Expected a local-only uploaded cover URL, received host "${coverHost}" instead.`,
      );
    }

    await page.screenshot({ path: screenshots[1].path, fullPage: true });

    const estimateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/season-books/estimate") &&
        response.request().method() === "POST",
    );

    await page.getByRole("button", { name: "시즌북 견적 생성" }).click();

    const estimateResponse = await estimateResponsePromise;
    await page.waitForURL(/\/order\/[^/?]+/, { timeout: 30000 });
    await page.getByText("배송 정보").waitFor({ timeout: 10000 });
    await page.getByText("주문 확인").waitFor({ timeout: 10000 });
    await page.screenshot({ path: screenshots[2].path, fullPage: true });

    await field(page, "수령인 이름").fill("QA 테스터");
    await field(page, "전화번호").fill("010-1234-5678");
    await field(page, "우편번호").fill("06236");
    await field(page, "기본 주소").fill("서울특별시 강남구 테헤란로 123");
    await field(page, "상세 주소").fill("4층 QA석");

    const orderResponsePromise = page.waitForResponse(
      (response) =>
        response.url().endsWith("/season-books/order") &&
        response.request().method() === "POST",
    );

    await page.getByRole("button", { name: "주문하기" }).click();

    const orderResponse = await orderResponsePromise;
    await page.waitForURL(/\/order\/[^/]+\/status/, { timeout: 30000 });
    await page
      .getByRole("heading", { name: "주문 정보" })
      .waitFor({ timeout: 10000 });
    await page.getByText("주문 완료").waitFor({ timeout: 10000 });
    await page.getByText("주문 확인").waitFor({ timeout: 10000 });
    await page.screenshot({ path: screenshots[3].path, fullPage: true });

    apiResponses.push({
      url: estimateResponse.url().replace(/\?.*$/u, ""),
      status: estimateResponse.status(),
    });
    apiResponses.push({
      url: orderResponse.url().replace(/\?.*$/u, ""),
      status: orderResponse.status(),
    });

    const estimateApiResponse = apiResponses.find((response) =>
      response.url.endsWith("/season-books/estimate"),
    );
    const orderApiResponse = apiResponses.find((response) =>
      response.url.endsWith("/season-books/order"),
    );

    return {
      ok:
        estimateApiResponse?.status === 201 && orderApiResponse?.status === 201,
      uploadedCoverIsLocal,
      estimateStatus: estimateApiResponse?.status ?? "not observed",
      orderStatus: orderApiResponse?.status ?? "not observed",
      finalOrderStatus: "주문 확인",
      finalProjectStatus: "주문 완료",
      finalUrl: page.url().replace(
        /\/order\/[^/]+\/status/u,
        "/order/<projectId>/status",
      ),
      screenshots,
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  ensureOutputDir();

  console.log("Building API and web apps...");
  await run(npmCommand, ["run", "build", "-w", "apps/api"], "build-api");
  await run(npmCommand, ["run", "build", "-w", "apps/web"], "build-web");

  const startedProcesses = [];

  try {
    if (!(await canFetch(`${baseApiUrl}/health`))) {
      console.log("Starting QA API server...");
      const apiServer = spawnLogged(
        npmCommand,
        ["run", "start:prod", "-w", "apps/api"],
        "api-server",
      );
      startedProcesses.push(apiServer.child);
      await waitFor(`${baseApiUrl}/health`, "QA API server");
    }

    if (!(await canFetch(baseWebUrl))) {
      console.log("Starting web server...");
      const webServer = spawnLogged(
        npmCommand,
        ["run", "start", "-w", "apps/web", "--", "--port", "3000"],
        "web-server",
      );
      startedProcesses.push(webServer.child);
      await waitFor(baseWebUrl, "web server");
    }

    console.log("Running browser order flow...");
    const result = await runBrowserFlow();
    writeMarkdownReport(result);
    await writePdfReport(result);
    fs.writeFileSync(path.join(outputDir, "order-flow-result.json"), `${JSON.stringify(result, null, 2)}\n`);
    console.log(`Order flow report written to ${path.join(outputDir, "order-flow-report.pdf")}`);
  } finally {
    for (const processHandle of startedProcesses.reverse()) {
      await killProcess(processHandle);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
