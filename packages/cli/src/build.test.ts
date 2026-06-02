import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { runBuild } from "./build";

let cwd: string;

beforeEach(() => {
  cwd = mkdtempSync(path.join(os.tmpdir(), "defold-typescript-build-"));
});

afterEach(() => {
  rmSync(cwd, { recursive: true, force: true });
});

function writeFile(rel: string, contents: string): void {
  const abs = path.join(cwd, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, contents);
}

const DEFAULT_TSCONFIG = JSON.stringify(
  {
    compilerOptions: { target: "ES2022", module: "ESNext", strict: true },
    include: ["src/**/*.ts"],
  },
  null,
  2,
);

describe("runBuild", () => {
  test("transpiles a single src/main.ts to src/main.lua by default", () => {
    writeFile("tsconfig.json", DEFAULT_TSCONFIG);
    writeFile("src/main.ts", "export const v = vmath.vector3(0, 0, 0);\n");

    const result = runBuild({ cwd });

    expect(result.written).toEqual(["src/main.lua"]);
    const lua = readFileSync(path.join(cwd, "src/main.lua"), "utf8");
    expect(lua.length).toBeGreaterThan(0);
  });

  test("preserves nested directory structure alongside source", () => {
    writeFile("tsconfig.json", DEFAULT_TSCONFIG);
    writeFile("src/a.ts", "export const a = 1;\n");
    writeFile("src/b/c.ts", "export const c = 2;\n");

    const result = runBuild({ cwd });

    expect(result.written.sort()).toEqual(["src/a.lua", "src/b/c.lua"].sort());
    expect(existsSync(path.join(cwd, "src/a.lua"))).toBe(true);
    expect(existsSync(path.join(cwd, "src/b/c.lua"))).toBe(true);
  });

  test("outDir of '.' or '' behaves identically to absent (alongside)", () => {
    for (const outDir of [".", ""]) {
      writeFile(
        "tsconfig.json",
        JSON.stringify(
          { compilerOptions: { outDir, strict: true }, include: ["src/**/*.ts"] },
          null,
          2,
        ),
      );
      writeFile("src/main.ts", "export const a = 1;\n");

      const result = runBuild({ cwd });

      expect(result.written).toEqual(["src/main.lua"]);
      expect(existsSync(path.join(cwd, "src/main.lua"))).toBe(true);
      rmSync(path.join(cwd, "src"), { recursive: true, force: true });
    }
  });

  test("honors tsconfig.compilerOptions.outDir when set", () => {
    writeFile(
      "tsconfig.json",
      JSON.stringify(
        {
          compilerOptions: { outDir: "out/lua", strict: true },
          include: ["src/**/*.ts"],
        },
        null,
        2,
      ),
    );
    writeFile("src/main.ts", "export const a = 1;\n");

    const result = runBuild({ cwd });

    expect(result.written).toEqual(["out/lua/main.lua"]);
    expect(existsSync(path.join(cwd, "out/lua/main.lua"))).toBe(true);
    expect(existsSync(path.join(cwd, "build/lua/main.lua"))).toBe(false);
  });

  test("throws when tsconfig.json is missing", () => {
    writeFile("src/main.ts", "export const a = 1;\n");

    expect(() => runBuild({ cwd })).toThrow(/defold-typescript build/);
    expect(existsSync(path.join(cwd, "build"))).toBe(false);
  });

  test("returns empty written list when src/ has no .ts files", () => {
    writeFile("tsconfig.json", DEFAULT_TSCONFIG);
    mkdirSync(path.join(cwd, "src"), { recursive: true });

    const result = runBuild({ cwd });

    expect(result.written).toEqual([]);
    expect(existsSync(path.join(cwd, "build/lua"))).toBe(false);
  });

  test("throws on type errors and writes no Lua for the failing file", () => {
    writeFile("tsconfig.json", DEFAULT_TSCONFIG);
    writeFile("src/main.ts", 'const x: number = "oops";\n');

    expect(() => runBuild({ cwd })).toThrow(/src\/main\.ts/);
    expect(existsSync(path.join(cwd, "src/main.lua"))).toBe(false);
  });

  test("resolves cross-file imports between src/ TypeScript files", () => {
    writeFile("tsconfig.json", DEFAULT_TSCONFIG);
    writeFile(
      "src/util.ts",
      "export function clamp(v: number, lo: number, hi: number): number {\n  return v < lo ? lo : v > hi ? hi : v;\n}\n",
    );
    writeFile(
      "src/main.ts",
      "import { clamp } from './util';\nexport const limit = clamp(42, 0, 100);\n",
    );

    const result = runBuild({ cwd });

    expect(result.written.sort()).toEqual(["src/main.lua", "src/util.lua"]);
    expect(existsSync(path.join(cwd, "src/main.lua"))).toBe(true);
    expect(existsSync(path.join(cwd, "src/util.lua"))).toBe(true);
  });

  test("writes a sibling .lua.map and a sourceMappingURL comment", () => {
    writeFile("tsconfig.json", DEFAULT_TSCONFIG);
    writeFile("src/main.ts", "export const v = vmath.vector3(0, 0, 0);\n");

    const result = runBuild({ cwd });

    expect(result.written).toEqual(["src/main.lua"]);
    expect(existsSync(path.join(cwd, "src/main.lua.map"))).toBe(true);

    const rawMap = readFileSync(path.join(cwd, "src/main.lua.map"), "utf8");
    const map = JSON.parse(rawMap) as { version: number };
    expect(map.version).toBe(3);

    const lua = readFileSync(path.join(cwd, "src/main.lua"), "utf8");
    expect(lua.trimEnd().endsWith("--# sourceMappingURL=main.lua.map")).toBe(true);
  });

  test("aggregates diagnostics across multiple broken files", () => {
    writeFile("tsconfig.json", DEFAULT_TSCONFIG);
    writeFile("src/a.ts", 'const a: number = "bad";\n');
    writeFile("src/b.ts", "const b: string = 42;\n");

    let caught: Error | undefined;
    try {
      runBuild({ cwd });
    } catch (err) {
      caught = err as Error;
    }
    expect(caught).toBeDefined();
    expect(caught?.message).toContain("src/a.ts");
    expect(caught?.message).toContain("src/b.ts");
  });
});
