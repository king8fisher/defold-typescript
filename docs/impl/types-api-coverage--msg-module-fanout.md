# Step: msg module fan-out (multi-module pipeline)

Status: shipped
Goal: types-api-coverage
PRD: docs/prd/vision.md#types-api-coverage
Branch: `step/types-api-coverage--msg-module-fanout`
Done when: `packages/types/scripts/regen.ts` contains `MODULE_MANIFEST`

## Context

The prior three slices land a complete vmath pipeline: parse → emit → wrap → publish, with a regen script, a drift-guard test, and a consumer type-level proof. The pipeline's primitives (`parseDefoldApiDoc`, `emitDeclarations`, `wrapAsAmbientGlobal`) are already namespace-agnostic — they take any `ApiModule` and any namespace string. What's hardcoded to `vmath` is only:

- the single `import vmathDoc from "../fixtures/vmath_doc.json"` in `scripts/regen.ts` and the single `writeFileSync` after it;
- the single `import "./generated/vmath"` in `index.d.ts`;
- the single byte-equality assertion in `test/regen.test.ts` (it reads `generated/vmath.d.ts` only);
- the vmath-only assertions in `test-d/ambient.ts`.

This slice proves the pipeline **scales beyond one module** by introducing `msg` — the second namespace and the smallest one a real Defold script reaches for (`msg.url(...)`, `msg.post(...)`). The seam is a `MODULE_MANIFEST` array in `regen.ts` that the regen script and the drift-guard test both iterate over; adding the next module (`hash`, `go`, `gui`, …) becomes a one-line manifest entry plus a vendored fixture, with no further pipeline edits.

`msg` is chosen as the second target because it (a) is small (~4 functions), (b) exercises cross-module type references (`msg.url(...)` returns `Url`, which is composed of `Hash`), and (c) is on the critical path for the lifecycle-hook slice (`on_message(self, message_id, message, sender)` types the same `msg.url`-shaped `sender`).

`hash`, `pprint`, and other true top-level globals (no `<namespace>.` prefix in the API doc) are **out of scope here** — they need an emitter mode for top-level functions, not just another manifest row.

## Tests to write first

Co-located per AGENTS.md § Testing.

- [ ] `packages/types/test/regen.test.ts` — loops over the exported `MODULE_MANIFEST`. For each entry, runs `parseDefoldApiDoc → emitDeclarations → wrapAsAmbientGlobal` and asserts the result equals the committed contents of `packages/types/generated/<outFile>` byte-for-byte. Failure message names the manifest entry: `"<outFile> is stale — run \`bun run regen\` in \`packages/types/\`"`. Replaces the existing vmath-only byte-equality test.
- [ ] `packages/types/test/regen.test.ts` — every file referenced by `MODULE_MANIFEST` exists on disk under `packages/types/generated/`. Catches "added to manifest, forgot to commit the generated file".
- [ ] `packages/types/test/regen.test.ts` — every `.d.ts` file in `packages/types/generated/` is referenced by exactly one `MODULE_MANIFEST` entry. Catches orphaned generated files left after a manifest entry was removed.
- [ ] `packages/types/test/regen.test.ts` — every committed generated file parses as syntactically-valid TypeScript via `new Bun.Transpiler({ loader: 'ts' }).scan(content)`. Generalises the existing vmath-only syntax check.
- [ ] `packages/types/test-d/ambient.ts` — `const u: Url = msg.url();` type-checks (zero-arg overload returns `Url`).
- [ ] `packages/types/test-d/ambient.ts` — `const u2: Url = msg.url("main:/go#script");` type-checks (string-arg overload).
- [ ] `packages/types/test-d/ambient.ts` — `msg.post(u, "increment_score");` and `msg.post(u, "increment_score", { amount: 10 });` both type-check (`message` arg is optional and accepts a table).
- [ ] `packages/types/test-d/ambient.ts` — `// @ts-expect-error` markers cover `msg.post(123, "x")` (receiver isn't a `Url`-shaped value) and `const _bad: string = msg.url();` (return is `Url`, not `string`).

## Implementation

1. **Vendor the msg fixture.** Pull `doc/src-script_msg.cpp_doc.json` from the same pinned Defold release used for vmath (`packages/types/fixtures/README.md` records the version):

   ```sh
   curl -L https://github.com/defold/defold/releases/download/1.12.4/ref-doc.zip -o /tmp/ref-doc.zip
   unzip -p /tmp/ref-doc.zip doc/src-script_msg.cpp_doc.json > packages/types/fixtures/msg_doc.json
   ```

   Append an `## msg_doc.json` section to `packages/types/fixtures/README.md` mirroring the existing `## vmath_doc.json` entry (same Defold version, same source-zip path, same refresh recipe with the new `unzip -p` path).

2. **Refactor `scripts/regen.ts` to a manifest loop.** Replace the hardcoded vmath pipeline with:

   ```ts
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
     { namespace: "vmath", doc: vmathDoc, outFile: "vmath.d.ts" },
     { namespace: "msg",   doc: msgDoc,   outFile: "msg.d.ts" },
   ];

   const GENERATED = resolve(import.meta.dir, "..", "generated");

   if (import.meta.main) {
     for (const entry of MODULE_MANIFEST) {
       const module = parseDefoldApiDoc(entry.doc);
       const emitted = emitDeclarations(module);
       const wrapped = wrapAsAmbientGlobal({
         namespace: module.namespace,
         emitted,
         importsFrom: "../src/core-types",
       });
       const out = resolve(GENERATED, entry.outFile);
       writeFileSync(out, wrapped);
       console.log(`wrote ${out}`);
     }
   }
   ```

   - `import.meta.main` guards the I/O so `MODULE_MANIFEST` and `GENERATED` can be imported by the drift-guard test without writing files.
   - `GENERATED` is exported implicitly by re-deriving it in the test (`resolve(import.meta.dir, "..", "generated")` from `test/regen.test.ts`); do not export it from `regen.ts` to avoid coupling the test to the script's I/O layout.
   - Manifest order is alphabetical by `namespace` for diff stability when later slices insert new entries.

3. **Regenerate and commit.** `bun --cwd packages/types run regen` writes the new `generated/msg.d.ts`. The committed `generated/vmath.d.ts` is byte-stable (the wrapper is unchanged); the drift-guard test will catch any unexpected diff.

4. **Add the side-effect import.** Edit `packages/types/index.d.ts`:

   ```ts
   import "./generated/msg";
   import "./generated/vmath";
   ```

   Alphabetical order keeps the diff small for future additions. The rest of `index.d.ts` (tooling re-exports) is unchanged.

5. **Generalise the drift-guard test.** Replace the vmath-only body of `packages/types/test/regen.test.ts` with a `for (const entry of MODULE_MANIFEST)` loop covering byte-equality and TS-syntax-valid for every manifest entry, plus the two manifest-vs-disk parity assertions (manifest entry → file exists; disk file → manifest entry). Read the committed file via `Bun.file(path).text()`. Use `it.each(MODULE_MANIFEST.map(...))` (or the equivalent `bun:test` pattern) so a failure names the offending namespace.

6. **Extend `test-d/ambient.ts`** with the msg-namespace assertions listed in "Tests to write first". `Url` is already imported from `../src/core-types` for vmath; reuse it.

7. **Run ci to green.** `bun run typecheck && bun run lint && bun test` from the repo root. Expected gotchas:
   - Biome may flag the unused `MODULE_MANIFEST` export inside `regen.ts` as `noUnusedImports`/`noUnusedVariables` for the `import.meta.main` branch — if it does, the test import (`packages/types/test/regen.test.ts`) is the legitimate consumer, so no `biome-ignore` is needed once the test ships.
   - `tsconfig.json` already includes `scripts/**/*.ts`; no `include` change required.
   - If `parseDefoldApiDoc` rejects the msg fixture (e.g. an `element.type` value not yet handled like `MESSAGE` or `PROPERTY`), the parser already ignores unknown element kinds (see `packages/types/src/api-doc.ts` `parseDefoldApiDoc` dispatch) — confirm by inspecting the parsed `ApiModule` interactively if any function is unexpectedly missing.

### Key references

- `packages/types/scripts/regen.ts` — current single-module shape; this slice replaces the body.
- `packages/types/test/regen.test.ts` — current single-module drift-guard; this slice generalises both assertions.
- `packages/types/index.d.ts` — current single side-effect import; this slice adds a second.
- `packages/types/test-d/ambient.ts` — current vmath-only proof; this slice extends with msg assertions and reuses the existing `Url` import.
- `packages/types/src/publish-dts.ts` — `wrapAsAmbientGlobal` already detects engine-type references (including `Url`) via word-boundary regex; no change.
- `packages/types/fixtures/README.md` — append an `## msg_doc.json` section mirroring the vmath entry (same Defold 1.12.4 pin).
- Defold API reference: <https://defold.com/ref/stable/msg/> — ground truth for what the fixture must describe.

## Divergence from plan

`msg.post` has `message: ["table", "nil"]` in its Defold API doc, which the test cases require to type-check as an optional argument. The emitter (`packages/types/src/emit-dts.ts` `emitParameter`) was extended one branch: when a parameter's `types` array contains `"nil"`, the parameter is emitted with a trailing `?` and `"nil"` is filtered out of the union. `vmath` has no `nil`-bearing params, so `generated/vmath.d.ts` remains byte-stable.

## Definition of done

- `packages/types/fixtures/msg_doc.json` exists, sourced from the same Defold 1.12.4 `ref-doc.zip` used for vmath, with the source path recorded in `packages/types/fixtures/README.md`.
- `packages/types/scripts/regen.ts` exports `MODULE_MANIFEST` and iterates over it; the `import.meta.main` guard fences the I/O.
- `packages/types/generated/msg.d.ts` exists as the committed wrapper output and is byte-equal to a fresh regen run.
- `packages/types/generated/vmath.d.ts` is unchanged (byte-stable).
- `packages/types/index.d.ts` side-effect-imports both `./generated/msg` and `./generated/vmath` in alphabetical order.
- `packages/types/test/regen.test.ts` iterates over `MODULE_MANIFEST` for byte-equality and TS-syntax-valid; the two manifest-vs-disk parity checks both pass.
- `packages/types/test-d/ambient.ts` exercises `msg.url()`, `msg.url("...")`, `msg.post(...)` (with and without the optional `message` arg), and the two `// @ts-expect-error` negatives.
- `bun run typecheck`, `bun run lint`, and `bun test` all exit 0 from the repo root.
- No new top-level dependencies. No new packages. No changes to `packages/transpiler` or `packages/cli`.
- Out of scope (deferred): true top-level globals (`hash(s)`, `pprint`, etc.) that have no `<namespace>.` prefix; lifecycle hooks and per-script `self` shapes (`init`, `update`, `on_message`, `on_input`, `final`); additional namespace fan-out beyond msg (`go`, `gui`, `render`, `physics`, `sound`, `sys`, `http`); JSDoc emission from `ApiFunction.description`; tightening of `table` / `function` type mappings; a `defold-ts regen` CLI command.
