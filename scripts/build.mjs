import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

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

const isVercelBuild =
  toBoolean(process.env.VERCEL) ||
  toBoolean(process.env.VERCEL_BUILD) ||
  Boolean(process.env.VERCEL_URL);

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (isVercelBuild) {
  console.log("[build] Detected Vercel build environment. Running Next.js build only.");
  run("npx", ["next", "build"]);
} else if (isCloudflarePages) {
  const studioPath = join(process.cwd(), "app", "studio");
  if (existsSync(studioPath)) {
    console.log("[build] Removing Sanity Studio for Cloudflare Pages deployment.");
    rmSync(studioPath, { recursive: true, force: true });
  }
  console.log("[build] Detected Cloudflare Pages environment. Running @cloudflare/next-on-pages.");
  run("npx", ["@cloudflare/next-on-pages"]);
} else {
  console.log("[build] Running standard Next.js build for local development.");
  run("npx", ["next", "build"]);
}
