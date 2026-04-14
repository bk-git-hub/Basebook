const { NestFactory } = require("@nestjs/core");

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
