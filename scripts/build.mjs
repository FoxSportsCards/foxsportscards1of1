import { spawnSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
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
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    const error = new Error(`Command failed: ${command} ${args.join(" ")}`);
    // Preserve numeric exit code when available.
    // @ts-ignore - extending error object for process exit handling.
    error.code = result.status ?? 1;
    throw error;
  }
}

function cleanNextDirectory() {
  run("node", ["scripts/clean-next.mjs"]);
}

cleanNextDirectory();

function runCloudflareBuild() {
  const studioPath = join(process.cwd(), "app", "studio");
  const studioBackupPath = join(process.cwd(), "app", `studio.__cf_build_backup_${Date.now()}`);
  const hasStudio = existsSync(studioPath);

  if (hasStudio) {
    console.log("[build] Temporarily disabling Sanity Studio for Cloudflare Pages deployment.");
    cpSync(studioPath, studioBackupPath, { recursive: true, force: true });
    rmSync(studioPath, { recursive: true, force: true });
  }

  try {
    console.log("[build] Detected Cloudflare Pages environment. Running @cloudflare/next-on-pages.");
    run("npx", ["@cloudflare/next-on-pages"]);
  } finally {
    if (hasStudio && existsSync(studioBackupPath) && !existsSync(studioPath)) {
      cpSync(studioBackupPath, studioPath, { recursive: true, force: true });
      rmSync(studioBackupPath, { recursive: true, force: true });
    } else if (existsSync(studioBackupPath)) {
      rmSync(studioBackupPath, { recursive: true, force: true });
    }
  }
}

try {
  if (isVercelBuild) {
    console.log("[build] Detected Vercel build environment. Running Next.js build only.");
    run("npx", ["next", "build"]);
  } else if (isCloudflarePages) {
    runCloudflareBuild();
  } else {
    console.log("[build] Running standard Next.js build for local development.");
    run("npx", ["next", "build"]);
  }
} catch (error) {
  console.error("[build] Build failed.");
  console.error(error);
  const code = typeof error === "object" && error !== null && "code" in error ? Number(error.code) : 1;
  process.exit(Number.isFinite(code) ? code : 1);
}
