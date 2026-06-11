import { describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { type ExtensionZip, extensionArchiveKey } from "./extension-archive";
import { runResolve } from "./resolve";

function tmp(): string {
  return mkdtempSync(join(tmpdir(), "resolve-"));
}

const ALPHA = `
- name: alpha
  type: table
  desc: Alpha extension.
  members:
  - name: do_alpha
    type: function
    desc: does alpha
    parameters:
      - name: self
        type: object
        desc: the script self
`;

interface FakeArchive {
  entries: string[];
  contents: Record<string, string>;
}

const someBytes = async (): Promise<Uint8Array> => new TextEncoder().encode("z");

function makeReadZip(byKey: Record<string, FakeArchive>): (zipPath: string) => ExtensionZip {
  return (zipPath: string) => {
    const archive = byKey[basename(dirname(zipPath))];
    if (archive === undefined) {
      throw new Error(`no fake archive for ${zipPath}`);
    }
    return {
      entries: () => archive.entries,
      read: (entry: string) => {
        const text = archive.contents[entry];
        if (text === undefined) {
          throw new Error(`unexpected read of ${entry}`);
        }
        return text;
      },
    };
  };
}

function writeProject(cwd: string, body: string): void {
  writeFileSync(join(cwd, "game.project"), body);
  writeFileSync(
    join(cwd, "tsconfig.json"),
    `${JSON.stringify({ compilerOptions: { types: ["@defold-typescript/types"] } }, null, 2)}\n`,
  );
}

describe("runResolve", () => {
  test("a one-dependency project materializes the surface and reports the extension", async () => {
    const cwd = tmp();
    const url = "https://example.com/alpha.zip";
    writeProject(cwd, `[project]\ntitle = Test\ndependencies#0 = ${url}\n`);
    const byKey: Record<string, FakeArchive> = {
      [extensionArchiveKey(url)]: {
        entries: ["ext/api/alpha.script_api", "ext/readme.md"],
        contents: { "ext/api/alpha.script_api": ALPHA },
      },
    };

    const result = await runResolve({
      cwd,
      cacheDir: tmp(),
      download: someBytes,
      readZip: makeReadZip(byKey),
    });

    expect(result.ok).toBe(true);
    expect(result.materializedSurface).toBe(".defold-types/extensions");
    expect(existsSync(join(cwd, ".defold-types", "extensions", "alpha.d.ts"))).toBe(true);

    const tsconfig = JSON.parse(readFileSync(join(cwd, "tsconfig.json"), "utf8")) as {
      compilerOptions: { types: string[] };
    };
    expect(tsconfig.compilerOptions.types).toContain("extensions");

    expect(result.extensions).toEqual([
      {
        url,
        provenance: "download",
        namespaces: ["alpha"],
        scriptApiCount: 1,
        assetOnly: false,
      },
    ]);
  });

  test("an asset-only dependency writes nothing and reports assetOnly", async () => {
    const cwd = tmp();
    const url = "https://example.com/asset.zip";
    writeProject(cwd, `[project]\ndependencies#0 = ${url}\n`);
    const byKey: Record<string, FakeArchive> = {
      [extensionArchiveKey(url)]: { entries: ["asset/foo.png"], contents: {} },
    };

    const result = await runResolve({
      cwd,
      cacheDir: tmp(),
      download: someBytes,
      readZip: makeReadZip(byKey),
    });

    expect(result.ok).toBe(true);
    expect(result.materializedSurface).toBeNull();
    expect(existsSync(join(cwd, ".defold-types"))).toBe(false);
    expect(result.extensions).toEqual([
      { url, provenance: "download", namespaces: [], scriptApiCount: 0, assetOnly: true },
    ]);
  });

  test("a project with no [dependencies] resolves clean with no writes", async () => {
    const cwd = tmp();
    writeProject(cwd, "[project]\ntitle = Test\n");
    const before = readFileSync(join(cwd, "tsconfig.json"), "utf8");

    const result = await runResolve({
      cwd,
      cacheDir: tmp(),
      download: someBytes,
      readZip: () => {
        throw new Error("readZip should not be called");
      },
    });

    expect(result.ok).toBe(true);
    expect(result.materializedSurface).toBeNull();
    expect(result.extensions).toEqual([]);
    expect(existsSync(join(cwd, ".defold-types"))).toBe(false);
    expect(readFileSync(join(cwd, "tsconfig.json"), "utf8")).toBe(before);
  });

  test("a missing game.project returns ok:false with an error and writes nothing", async () => {
    const cwd = tmp();

    const result = await runResolve({ cwd, cacheDir: tmp() });

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.materializedSurface).toBeNull();
    expect(result.extensions).toEqual([]);
    expect(existsSync(join(cwd, ".defold-types"))).toBe(false);
  });

  test("a game.project with no [project] section returns ok:false", async () => {
    const cwd = tmp();
    writeFileSync(join(cwd, "game.project"), "[display]\nwidth = 640\n");

    const result = await runResolve({ cwd, cacheDir: tmp() });

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });
});
