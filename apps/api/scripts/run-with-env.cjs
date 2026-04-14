const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawn } = require('node:child_process');
const dotenv = require('dotenv');

const apiRoot = resolve(__dirname, '..');
const envPath = resolve(apiRoot, '.env');
const fallbackEnvPath = resolve(apiRoot, '.env.example');
const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error('Missing command for run-with-env wrapper.');
  process.exit(1);
}

function shouldLoadFallbackEnvExample(env = process.env) {
  const runningOnRailway = Boolean(
    env.RAILWAY_PROJECT_ID ||
      env.RAILWAY_ENVIRONMENT_ID ||
      env.RAILWAY_SERVICE_ID,
  );

  return !runningOnRailway && env.NODE_ENV !== 'production';
}

const envFilePath = existsSync(envPath)
  ? envPath
  : shouldLoadFallbackEnvExample()
    ? fallbackEnvPath
    : null;

if (envFilePath && existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath });
}

const quoteForCmd = (value) => {
  if (!/[\s"]/u.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
};

const child =
  process.platform === 'win32'
    ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', [command, ...args].map(quoteForCmd).join(' ')], {
        cwd: apiRoot,
        env: process.env,
        stdio: 'inherit',
      })
    : spawn(command, args, {
        cwd: apiRoot,
        env: process.env,
        stdio: 'inherit',
      });

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
