import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  outputFileTracingRoot: path.resolve(currentDir, "../.."),
  turbopack: {
    root: path.resolve(currentDir, "../.."),
  },
};

export default nextConfig;
