import { spawnSync } from "node:child_process";

const truthy = new Set(["1", "true", "yes"]);

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null) return false;
  return truthy.has(String(value).trim().toLowerCase());
}

const isCloudflarePages =
  toBoolean(process.env.CF_PAGES) ||
  Boolean(process.env.CF_PAGES_URL) ||
  Boolean(process.env.CF_PAGES_PROJECT_ID);

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (isCloudflarePages) {
  console.log("[build] Detected Cloudflare Pages environment. Running @cloudflare/next-on-pages.");
  run("npx", ["@cloudflare/next-on-pages"]);
} else {
  console.log("[build] Running standard Next.js build for local development.");
  run("npx", ["next", "build"]);
}
