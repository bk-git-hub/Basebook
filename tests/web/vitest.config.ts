import path from "node:path";

import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../apps/web/src"),
      "@web": path.resolve(__dirname, "../../apps/web/src"),
      "@basebook/contracts": path.resolve(
        __dirname,
        "../../packages/contracts/src/index.ts",
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setup/vitest.setup.tsx"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
