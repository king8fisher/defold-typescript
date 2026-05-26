import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import vmathDoc from "../fixtures/vmath_doc.json" with { type: "json" };
import { parseDefoldApiDoc } from "../src/api-doc";
import { emitDeclarations } from "../src/emit-dts";
import { wrapAsAmbientGlobal } from "../src/publish-dts";

const module = parseDefoldApiDoc(vmathDoc);
const emitted = emitDeclarations(module);
const wrapped = wrapAsAmbientGlobal({
  namespace: module.namespace,
  emitted,
  importsFrom: "../src/core-types",
});
const out = resolve(import.meta.dir, "..", "generated", "vmath.d.ts");
writeFileSync(out, wrapped);
console.log(`wrote ${out}`);
