import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import vmathDoc from "../fixtures/vmath_doc.json" with { type: "json" };
import { parseDefoldApiDoc } from "../src/api-doc";
import { emitDeclarations } from "../src/emit-dts";
import { wrapAsAmbientGlobal } from "../src/publish-dts";

const generatedPath = resolve(import.meta.dir, "..", "generated", "vmath.d.ts");

describe("regen drift guard", () => {
  test("committed generated/vmath.d.ts matches a fresh pipeline run byte-for-byte", async () => {
    const module = parseDefoldApiDoc(vmathDoc);
    const emitted = emitDeclarations(module);
    const fresh = wrapAsAmbientGlobal({
      namespace: module.namespace,
      emitted,
      importsFrom: "../src/core-types",
    });
    const committed = await Bun.file(generatedPath).text();
    expect(committed).toBe(fresh);
    if (committed !== fresh) {
      throw new Error("vmath.d.ts is stale — run `bun run regen` in `packages/types/`");
    }
  });

  test("generated/vmath.d.ts is syntactically-valid TypeScript", async () => {
    const content = await Bun.file(generatedPath).text();
    const transpiler = new Bun.Transpiler({ loader: "ts" });
    expect(() => transpiler.scan(content)).not.toThrow();
  });
});
