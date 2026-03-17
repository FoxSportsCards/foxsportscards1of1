import { existsSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const nextDir = join(process.cwd(), ".next");

if (!existsSync(nextDir)) {
  process.exit(0);
}

function runShellCleanup(targetPath) {
  if (process.platform === "win32") {
    spawnSync("cmd", ["/c", "rmdir", "/s", "/q", targetPath], {
      stdio: "ignore",
      shell: true,
    });
    return;
  }

  spawnSync("rm", ["-rf", targetPath], {
    stdio: "ignore",
    shell: false,
  });
}

function tryDelete(targetPath) {
  rmSync(targetPath, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 120,
  });
}

try {
  tryDelete(nextDir);
} catch (error) {
  console.warn("[dev] Could not fully remove .next before startup.");
  console.warn(error);
}

if (existsSync(nextDir)) {
  runShellCleanup(nextDir);
}

if (existsSync(nextDir)) {
  const staleDir = join(process.cwd(), `.next-stale-${Date.now()}`);
  try {
    renameSync(nextDir, staleDir);
    tryDelete(staleDir);
  } catch (error) {
    console.warn("[dev] Could not rename stale .next directory.");
    console.warn(error);
  }
}

if (existsSync(nextDir)) {
  console.warn("[dev] .next directory still exists after cleanup attempts.");
}
