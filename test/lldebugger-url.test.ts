import { describe, expect, test } from "bun:test";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const repoRoot = join(import.meta.dir, "..");

function git(args: string[]): string {
  const result = Bun.spawnSync(["git", ...args], { cwd: repoRoot });
  if (result.exitCode !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.toString()}`);
  }
  return result.stdout.toString();
}

function trackedFiles(): string[] {
  return git(["ls-files"])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isBinary(buf: Buffer): boolean {
  return buf.subarray(0, 8000).includes(0);
}

const SELF = "test/lldebugger-url.test.ts";
// The vendored snapshot under scripts/lldebugger/library/ is a byte-identical
// pinned copy of the upstream MIT library payload (drift-guarded by the packer
// test); its upstream README legitimately names the upstream URL and must not
// be rewritten. It is not a guide/scaffold artifact.
const VENDORED_SNAPSHOT = "scripts/lldebugger/library/";
// The upstream third-party archive URL we have migrated away from. Tracked
// guide/scaffold artifacts must use our pinned release URL instead; the
// gitignored planning docs that discuss the migration are not tracked.
const UPSTREAM_ARCHIVE_URL = "ts-defold/defold-lldebugger/archive/extension.zip";

function scan(needle: string): string[] {
  const offenders: string[] = [];
  for (const file of trackedFiles()) {
    if (file === SELF || file.startsWith(VENDORED_SNAPSHOT)) continue;
    if (!statSync(join(repoRoot, file)).isFile()) continue;
    const buf = readFileSync(join(repoRoot, file));
    if (isBinary(buf)) continue;
    if (buf.toString("utf8").includes(needle)) offenders.push(file);
  }
  return offenders;
}

describe("lldebugger url", () => {
  test("no tracked file references the upstream ts-defold archive URL", () => {
    expect(scan(UPSTREAM_ARCHIVE_URL)).toEqual([]);
  });

  test("scan tolerates a tracked submodule gitlink", () => {
    expect(() => scan(UPSTREAM_ARCHIVE_URL)).not.toThrow();
  });
});
