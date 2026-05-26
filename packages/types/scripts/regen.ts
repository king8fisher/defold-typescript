import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import goDoc from "../fixtures/go_doc.json" with { type: "json" };
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

// TS reserved words that pass api-doc's identifier check but break `declare namespace { function <name>() }`.
// Functions with these names are dropped during regen; restoring them requires renaming inside emit-dts.
const TS_RESERVED_FUNCTION_NAMES = new Set([
  "delete",
  "new",
  "class",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "var",
  "let",
  "const",
  "try",
  "catch",
  "finally",
  "throw",
  "typeof",
  "instanceof",
  "in",
  "void",
  "yield",
  "await",
  "null",
  "true",
  "false",
  "super",
  "this",
  "import",
  "export",
  "default",
  "with",
  "debugger",
  "extends",
]);

export const MODULE_MANIFEST: readonly ModuleManifestEntry[] = [
  { namespace: "go", doc: goDoc, outFile: "go.d.ts" },
  { namespace: "msg", doc: msgDoc, outFile: "msg.d.ts" },
  { namespace: "vmath", doc: vmathDoc, outFile: "vmath.d.ts" },
];

export interface GenerateResult {
  contents: string;
  dropped: string[];
}

export function generateModuleDeclaration(entry: ModuleManifestEntry): GenerateResult {
  const module = parseDefoldApiDoc(entry.doc);
  const prefix = `${module.namespace}.`;
  const dropped: string[] = [];
  module.functions = module.functions.filter((fn) => {
    const local = fn.name.startsWith(prefix) ? fn.name.slice(prefix.length) : fn.name;
    if (TS_RESERVED_FUNCTION_NAMES.has(local)) {
      dropped.push(fn.name);
      return false;
    }
    return true;
  });
  const emitted = emitDeclarations(module);
  const contents = wrapAsAmbientGlobal({
    namespace: module.namespace,
    emitted,
    importsFrom: "../src/core-types",
  });
  return { contents, dropped };
}

if (import.meta.main) {
  const generated = resolve(import.meta.dir, "..", "generated");
  for (const entry of MODULE_MANIFEST) {
    const { contents, dropped } = generateModuleDeclaration(entry);
    if (dropped.length > 0) {
      console.log(
        `note: dropped reserved-name function(s) from ${entry.namespace}: ${dropped.join(", ")}`,
      );
    }
    const out = resolve(generated, entry.outFile);
    writeFileSync(out, contents);
    console.log(`wrote ${out}`);
  }
}
