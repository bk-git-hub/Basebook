import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

const repoRoot = path.resolve(__dirname, "../..");
const localFullStackDir = path.resolve(
  __dirname,
  "test-results",
  "local-full-stack",
);
const apiPrismaDir = path.resolve(repoRoot, "apps/api/prisma");
const defaultPlaywrightPort = process.env.PLAYWRIGHT_PORT || "3100";
const webBaseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${defaultPlaywrightPort}`;
const apiBaseURL =
  process.env.PLAYWRIGHT_API_BASE_URL || "http://localhost:4000";

function readStringEnv() {
  return Object.fromEntries(
    Object.entries(process.env).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

const baseEnv = readStringEnv();
const apiDatabaseUrl = `file:${path
  .relative(apiPrismaDir, path.join(localFullStackDir, "qa-e2e.db"))
  .replace(/\\/g, "/")}`;

export default defineConfig({
  testDir: "./src/e2e",
  fullyParallel: false,
  reporter: "list",
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: webBaseURL,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command:
        "node tests/web/scripts/prepare-local-e2e.cjs && npm run build -w apps/api && npm run start:prod -w apps/api",
      cwd: repoRoot,
      env: {
        ...baseEnv,
        DATABASE_URL: apiDatabaseUrl,
        PORT: "4000",
        SWEETBOOK_ESTIMATE_MODE: "local",
        SWEETBOOK_ORDER_MODE: "local",
        UPLOAD_STORAGE_DRIVER: "local",
      },
      reuseExistingServer: false,
      timeout: 180000,
      url: `${apiBaseURL}/health`,
    },
    {
      command:
        `npm run build -w apps/web && npm run start -w apps/web -- --port ${defaultPlaywrightPort}`,
      cwd: repoRoot,
      env: {
        ...baseEnv,
        NEXT_PUBLIC_API_BASE_URL: apiBaseURL,
      },
      reuseExistingServer: false,
      timeout: 180000,
      url: webBaseURL,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
