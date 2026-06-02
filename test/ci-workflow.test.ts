import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

const workflowPath = join(import.meta.dir, "..", ".github", "workflows", "ci.yml");

function loadWorkflow(): Record<string, unknown> {
  const raw = readFileSync(workflowPath, "utf8");
  return parse(raw) as Record<string, unknown>;
}

describe("ci workflow", () => {
  test("is valid YAML", () => {
    expect(() => loadWorkflow()).not.toThrow();
  });

  test("triggers on push and pull_request", () => {
    const wf = loadWorkflow();
    // YAML parses the bare `on:` key as boolean true, so read it back tolerantly.
    const on = (wf.on ?? wf[true as unknown as string]) as Record<string, unknown>;
    expect(on).toBeDefined();
    expect(Object.keys(on)).toContain("push");
    expect(Object.keys(on)).toContain("pull_request");
  });

  test("has a job that runs `bun test`", () => {
    const wf = loadWorkflow();
    const jobs = wf.jobs as Record<string, { steps?: Array<{ run?: string }> }>;
    expect(jobs).toBeDefined();
    const runs = Object.values(jobs)
      .flatMap((job) => job.steps ?? [])
      .map((step) => step.run ?? "");
    expect(runs.some((cmd) => cmd.includes("bun test"))).toBe(true);
  });

  test("test job fans out across the three GitHub-hosted OS images", () => {
    const wf = loadWorkflow();
    const jobs = wf.jobs as Record<string, { strategy?: { matrix?: { os?: unknown } } }>;
    const os = jobs.test?.strategy?.matrix?.os;
    expect(os).toEqual(["ubuntu-latest", "windows-latest", "macos-latest"]);
  });

  test("test job runs-on the matrix os expression", () => {
    const wf = loadWorkflow();
    const jobs = wf.jobs as Record<string, { "runs-on"?: unknown }>;
    // ${{ matrix.os }} is a GitHub Actions expression, not a JS template literal.
    // biome-ignore lint/suspicious/noTemplateCurlyInString: literal workflow value under assertion
    expect(jobs.test?.["runs-on"]).toBe("${{ matrix.os }}");
  });

  test("a job runs lint and typecheck so they gate every push", () => {
    const wf = loadWorkflow();
    const jobs = wf.jobs as Record<string, { steps?: Array<{ run?: string }> }>;
    const runs = Object.values(jobs)
      .flatMap((job) => job.steps ?? [])
      .map((step) => step.run ?? "");
    expect(runs.some((cmd) => cmd.includes("bun run lint"))).toBe(true);
    expect(runs.some((cmd) => cmd.includes("bun run typecheck"))).toBe(true);
  });

  test("every install pins the lockfile so the toolchain cannot drift", () => {
    const wf = loadWorkflow();
    const jobs = wf.jobs as Record<string, { steps?: Array<{ run?: string }> }>;
    const installs = Object.values(jobs)
      .flatMap((job) => job.steps ?? [])
      .map((step) => step.run ?? "")
      .filter((cmd) => cmd.includes("bun install"));
    expect(installs.length).toBeGreaterThan(0);
    for (const cmd of installs) {
      expect(cmd).toContain("--frozen-lockfile");
    }
  });
});

describe("lint gate", () => {
  test("the lint script fails on warnings, not only errors", async () => {
    const manifest = await Bun.file(join(import.meta.dir, "..", "package.json")).json();
    expect(manifest.scripts.lint).toContain("--error-on-warnings");
  });
});
