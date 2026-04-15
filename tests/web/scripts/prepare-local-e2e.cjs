const fs = require("node:fs");
const path = require("node:path");

const outputDir = path.resolve(
  __dirname,
  "..",
  "test-results",
  "local-full-stack",
);

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });
