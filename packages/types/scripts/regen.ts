import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import msgDoc from "../fixtures/msg_doc.json" with { type: "json" };
import vmathDoc from "../fixtures/vmath_doc.json" with { type: "json" };
import { parseDefoldApiDoc } from "../src/api-doc";
import { emitDeclarations } from "../src/emit-dts";
import { wrapAsAmbientGlobal } from "../src/publish-dts";

export interface ModuleManifestEntry {
  readonly namespace: string;
  readonly doc: unknown;
  readonly outFile: string;
}

export const MODULE_MANIFEST: readonly ModuleManifestEntry[] = [
  { namespace: "msg", doc: msgDoc, outFile: "msg.d.ts" },
  { namespace: "vmath", doc: vmathDoc, outFile: "vmath.d.ts" },
];

if (import.meta.main) {
  const generated = resolve(import.meta.dir, "..", "generated");
  for (const entry of MODULE_MANIFEST) {
    const module = parseDefoldApiDoc(entry.doc);
    const emitted = emitDeclarations(module);
    const wrapped = wrapAsAmbientGlobal({
      namespace: module.namespace,
      emitted,
      importsFrom: "../src/core-types",
    });
    const out = resolve(generated, entry.outFile);
    writeFileSync(out, wrapped);
    console.log(`wrote ${out}`);
  }
}
