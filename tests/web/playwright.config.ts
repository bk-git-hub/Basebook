import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

const repoRoot = path.resolve(__dirname, "../..");
const defaultPlaywrightPort = process.env.PLAYWRIGHT_PORT || "3100";
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ||
  `http://localhost:${defaultPlaywrightPort}`;

export default defineConfig({
  testDir: "./src/e2e",
  fullyParallel: true,
  reporter: "list",
  timeout: 60000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command:
      `npm run build -w apps/web && npm run start -w apps/web -- --port ${defaultPlaywrightPort}`,
    cwd: repoRoot,
    port: Number(defaultPlaywrightPort),
    reuseExistingServer: false,
    timeout: 180000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
