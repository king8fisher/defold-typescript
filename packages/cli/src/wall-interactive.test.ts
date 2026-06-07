import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { CheckboxPrompt } from "./wall-interactive";
import { buildWallChoices, runWallInteractive } from "./wall-interactive";

let cwd: string;

beforeEach(() => {
  cwd = mkdtempSync(path.join(os.tmpdir(), "defold-typescript-wall-menu-"));
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

function touch(rel: string, contents = ""): void {
  const full = path.join(cwd, rel);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, contents);
}

function writeRootTsconfig(value: unknown): void {
  writeFileSync(path.join(cwd, "tsconfig.json"), `${JSON.stringify(value, null, 2)}\n`);
}

function readRefs(): { path: string }[] {
  return JSON.parse(readFileSync(path.join(cwd, "tsconfig.json"), "utf8")).references ?? [];
}

describe("buildWallChoices", () => {
  test("single-kind dirs are selectable, checked iff currently walled; mixed dirs disabled", () => {
    writeRootTsconfig({ include: ["src/**/*.ts"], references: [{ path: "src/ui" }] });
    touch("src/ui/hud.ts", "export default defineGuiScript({});");
    touch("src/render/cam.ts", "export default defineRenderScript({});");
    touch("src/mix/a.ts", "export default defineScript({});");
    touch("src/mix/b.ts", "export default defineGuiScript({});");

    expect(buildWallChoices(cwd)).toEqual([
      { value: "src/mix", name: "src/mix", disabled: "mixed: gui-script, script" },
      { value: "src/render", name: "src/render (render-script)", checked: false },
      { value: "src/ui", name: "src/ui (gui-script)", checked: true },
    ]);
  });

  test("a component-free tree yields no choices", () => {
    writeRootTsconfig({ include: ["src/**/*.ts"] });
    touch("src/.gitkeep");
    expect(buildWallChoices(cwd)).toEqual([]);
  });
});

describe("runWallInteractive", () => {
  function scaffold(): void {
    writeRootTsconfig({ compilerOptions: { strict: true }, include: ["src/**/*.ts"] });
    touch("src/ui/hud.ts", "export default defineGuiScript({});");
    touch("src/render/cam.ts", "export default defineRenderScript({});");
  }

  test("reconciles disk to the checkbox selection via applyWallSelection", async () => {
    scaffold();
    const checkbox: CheckboxPrompt = async () => ["src/ui"];

    const applied = await runWallInteractive(cwd, { checkbox });

    expect(applied.map((w) => w.dir)).toEqual(["src/ui"]);
    expect(existsSync(path.join(cwd, "src/ui/tsconfig.json"))).toBe(true);
    expect(readRefs()).toEqual([{ path: "src/ui" }]);
  });

  test("an empty selection removes every existing wall", async () => {
    scaffold();
    await runWallInteractive(cwd, { checkbox: async () => ["src/ui", "src/render"] });

    const applied = await runWallInteractive(cwd, { checkbox: async () => [] });

    expect(applied).toEqual([]);
    expect(existsSync(path.join(cwd, "src/ui/tsconfig.json"))).toBe(false);
    expect(existsSync(path.join(cwd, "src/render/tsconfig.json"))).toBe(false);
    expect(readRefs()).toEqual([]);
  });

  test("passes the eligible choices to the injected checkbox", async () => {
    scaffold();
    let seen: { value: string }[] = [];
    const checkbox: CheckboxPrompt = async (opts) => {
      seen = opts.choices;
      return [];
    };

    await runWallInteractive(cwd, { checkbox });

    expect(seen.map((c) => c.value)).toEqual(["src/render", "src/ui"]);
  });
});
