import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import * as path from "node:path";

interface Manifest {
  name?: string;
  bin?: Record<string, string>;
  dependencies?: Record<string, string>;
}

const ROOT = path.resolve(import.meta.dir, "..", "..", "..");

function readManifest(rel: string): Manifest {
  return JSON.parse(readFileSync(path.join(ROOT, rel), "utf8")) as Manifest;
}

describe("workspace package names", () => {
  const cli = readManifest("packages/cli/package.json");
  const transpiler = readManifest("packages/transpiler/package.json");
  const types = readManifest("packages/types/package.json");

  test("cli is @defold-typescript/cli", () => {
    expect(cli.name).toBe("@defold-typescript/cli");
  });

  test("cli bin exposes defold-typescript (not defold-ts)", () => {
    expect(cli.bin).toBeDefined();
    const bin = cli.bin ?? {};
    expect(Object.keys(bin)).toContain("defold-typescript");
    expect(Object.keys(bin)).not.toContain("defold-ts");
  });

  test("transpiler is @defold-typescript/transpiler", () => {
    expect(transpiler.name).toBe("@defold-typescript/transpiler");
  });

  test("types is @defold-typescript/types", () => {
    expect(types.name).toBe("@defold-typescript/types");
  });

  test("cli workspace deps use the @defold-typescript scope", () => {
    const deps = cli.dependencies ?? {};
    expect(deps["@defold-typescript/transpiler"]).toBe("workspace:*");
    expect(deps["@defold-typescript/types"]).toBe("workspace:*");
  });

  test("transpiler depends on @defold-typescript/types", () => {
    const deps = transpiler.dependencies ?? {};
    expect(deps["@defold-typescript/types"]).toBe("workspace:*");
  });
});
