import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
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

// A NUL byte in the leading chunk is the binary signal; skip those blobs.
function isBinary(buf: Buffer): boolean {
  return buf.subarray(0, 8000).includes(0);
}

const SELF = "test/no-secret-sauce-leak.test.ts";
// .gitignore legitimately carries the planning paths (which embed the
// `step-pipeline` token and the doc-home links), so it is excluded from both
// content scans.
const GITIGNORE = ".gitignore";

const LEAK_TOKENS = ["next-step", "plan-step", "implement-step", "step-pipeline"];
const PATH_LINKS = ["docs/prd/", "docs/impl/"];

function scan(needles: string[]): string[] {
  const offenders: string[] = [];
  for (const file of trackedFiles()) {
    if (file === SELF || file === GITIGNORE) continue;
    const buf = readFileSync(join(repoRoot, file));
    if (isBinary(buf)) continue;
    const text = buf.toString("utf8");
    for (const needle of needles) {
      if (text.includes(needle)) {
        offenders.push(`${file}: ${needle}`);
        break;
      }
    }
  }
  return offenders;
}

describe("no secret-sauce leak", () => {
  test(".gitignore excludes the planning machinery", () => {
    const gitignore = readFileSync(join(repoRoot, ".gitignore"), "utf8");
    expect(gitignore).toContain("docs/impl");
    expect(gitignore).toContain("docs/prd");
    expect(gitignore).toContain("docs/step-pipeline.md");
  });

  test("the planning docs are untracked", () => {
    const tracked = git(["ls-files", "docs/impl", "docs/prd", "docs/step-pipeline.md"]).trim();
    expect(tracked).toBe("");
  });

  test("no tracked file names a planning skill or the pipeline token", () => {
    expect(scan(LEAK_TOKENS)).toEqual([]);
  });

  test("no tracked file links to the planning doc homes", () => {
    expect(scan(PATH_LINKS)).toEqual([]);
  });
});
