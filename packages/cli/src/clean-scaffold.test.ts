import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { runInit } from "./init";

const REPO_ROOT = path.resolve(import.meta.dir, "..", "..", "..");
const TYPES_PKG = path.join(REPO_ROOT, "packages", "types");
const BIN_DIR = path.join(REPO_ROOT, "node_modules", ".bin");

function linkTypes(cwd: string): void {
  const scope = path.join(cwd, "node_modules", "@defold-typescript");
  mkdirSync(scope, { recursive: true });
  symlinkSync(TYPES_PKG, path.join(scope, "types"), "dir");
}

function run(cmd: string, args: string[], cwd: string): { code: number; output: string } {
  const proc = Bun.spawnSync([path.join(BIN_DIR, cmd), ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  return { code: proc.exitCode, output: `${proc.stdout.toString()}${proc.stderr.toString()}` };
}

describe("scaffolded project is clean out of the box", () => {
  test("tsc --noEmit passes on a freshly scaffolded project", () => {
    const cwd = mkdtempSync(path.join(os.tmpdir(), "defold-typescript-clean-tsc-"));
    try {
      runInit({ cwd });
      linkTypes(cwd);

      const { code, output } = run("tsc", ["--noEmit", "-p", "tsconfig.json"], cwd);
      if (code !== 0) {
        throw new Error(`tsc reported errors on the scaffold:\n${output}`);
      }
      expect(code).toBe(0);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });

  test("biome check passes on the scaffolded source surface", () => {
    const cwd = mkdtempSync(path.join(os.tmpdir(), "defold-typescript-clean-biome-"));
    try {
      runInit({ cwd });

      const { code, output } = run("biome", ["check", "src"], cwd);
      if (code !== 0) {
        throw new Error(`biome reported violations on the scaffold:\n${output}`);
      }
      expect(code).toBe(0);
    } finally {
      rmSync(cwd, { recursive: true, force: true });
    }
  });
});
