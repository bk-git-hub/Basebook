const path = require("node:path");
const { spawnSync } = require("node:child_process");

const { NestFactory } = require("@nestjs/core");

process.env.PORT = "4000";
process.env.SWEETBOOK_ESTIMATE_MODE = "local";
process.env.SWEETBOOK_ORDER_MODE = "local";
process.env.UPLOAD_STORAGE_DRIVER = "local";

const repoRoot = path.resolve(__dirname, "../../..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const dbInit = spawnSync(npmCommand, ["run", "db:init", "-w", "apps/api"], {
  cwd: repoRoot,
  env: process.env,
  stdio: "inherit",
  windowsHide: true,
});

if (dbInit.status !== 0) {
  process.exit(dbInit.status ?? 1);
}

const { configureApp } = require("../../../apps/api/dist/app.config");
const { AppModule } = require("../../../apps/api/dist/app.module");
const { loadApiEnv } = require("../../../apps/api/dist/config/load-api-env");

loadApiEnv();

async function main() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(4000, "127.0.0.1");
  console.log("QA API listening on http://127.0.0.1:4000");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
