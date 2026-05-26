import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { MODULE_MANIFEST } from "../scripts/regen";
import { parseDefoldApiDoc } from "../src/api-doc";
import { emitDeclarations } from "../src/emit-dts";
import { wrapAsAmbientGlobal } from "../src/publish-dts";

const GENERATED = resolve(import.meta.dir, "..", "generated");

describe("regen drift guard", () => {
  test.each(
    MODULE_MANIFEST.map((entry) => [entry.namespace, entry] as const),
  )("%s: committed generated file matches a fresh pipeline run byte-for-byte", async (_namespace, entry) => {
    const module = parseDefoldApiDoc(entry.doc);
    const emitted = emitDeclarations(module);
    const fresh = wrapAsAmbientGlobal({
      namespace: module.namespace,
      emitted,
      importsFrom: "../src/core-types",
    });
    const committed = await Bun.file(resolve(GENERATED, entry.outFile)).text();
    if (committed !== fresh) {
      throw new Error(`${entry.outFile} is stale — run \`bun run regen\` in \`packages/types/\``);
    }
    expect(committed).toBe(fresh);
  });

  test.each(
    MODULE_MANIFEST.map((entry) => [entry.outFile, entry] as const),
  )("%s: committed generated file is syntactically-valid TypeScript", async (_outFile, entry) => {
    const content = await Bun.file(resolve(GENERATED, entry.outFile)).text();
    const transpiler = new Bun.Transpiler({ loader: "ts" });
    expect(() => transpiler.scan(content)).not.toThrow();
  });

  test("every MODULE_MANIFEST entry has a committed generated file", () => {
    for (const entry of MODULE_MANIFEST) {
      const path = resolve(GENERATED, entry.outFile);
      const exists = Bun.file(path).size > 0;
      if (!exists) {
        throw new Error(
          `MODULE_MANIFEST entry "${entry.namespace}" references missing file ${entry.outFile}`,
        );
      }
      expect(exists).toBe(true);
    }
  });

  test("every committed generated/*.d.ts is referenced by exactly one MODULE_MANIFEST entry", () => {
    const onDisk = readdirSync(GENERATED).filter((f) => f.endsWith(".d.ts"));
    for (const file of onDisk) {
      const matches = MODULE_MANIFEST.filter((e) => e.outFile === file);
      if (matches.length !== 1) {
        throw new Error(
          `generated/${file} is referenced by ${matches.length} MODULE_MANIFEST entries (expected exactly 1)`,
        );
      }
      expect(matches.length).toBe(1);
    }
  });
});
