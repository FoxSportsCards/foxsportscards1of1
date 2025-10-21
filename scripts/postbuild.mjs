import { spawnSync } from "node:child_process";

const normalize = (value) => (value ?? "").toString().trim().toLowerCase();

const shouldRun =
  normalize(process.env.CI) === "true" ||
  normalize(process.env.CI) === "1" ||
  normalize(process.env.CF_PAGES) === "true" ||
  normalize(process.env.CF_PAGES) === "1";

if (!shouldRun) {
  console.log("[postbuild] Skipping @cloudflare/next-on-pages conversion outside CI.");
  process.exit(0);
}

const args = ["@cloudflare/next-on-pages"];

const result = spawnSync("npx", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
