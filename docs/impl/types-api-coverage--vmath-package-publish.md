# Step: vmath package publish (ambient `@defold-ts/types`)

Status: planned
Goal: types-api-coverage
PRD: docs/prd/vision.md#types-api-coverage
Branch: `step/types-api-coverage--vmath-package-publish`
Done when: `packages/types/index.d.ts` exists

## Context

The previous two slices land an in-memory `ApiModule` and a pure `emitDeclarations(module) → string` function. Both are reachable from `@defold-ts/types`'s tooling surface (`parseDefoldApiDoc`, `emitDeclarations`, the core engine value type aliases, `DEFOLD_TYPE_MAP`) and `@defold-ts/transpiler` already depends on that surface. But nothing in the package yet exposes the **engine globals** — `vmath.vector3(…)`, `vmath.PI`, etc. — to end-user `.ts` script code. The PRD goal explicitly mandates this:

> Module exported as `@defold-ts/types`, consumable via a single `import type` from user code.

A Defold script authored in TypeScript looks like:

```ts
function update(self: SelfShape, dt: number) {
  self.pos = vmath.vector3(0, dt * 0.1, 0);
}
```

`vmath` is **global** at runtime — the Defold Lua VM exposes it that way and `typescript-to-lua` (TSTL) preserves direct global calls when their declaration is an ambient `declare namespace vmath`. So the TS-side declaration must be ambient, not module-scoped.

This slice plugs that gap without disturbing the existing tooling surface. Two surfaces coexist after this step:

1. **Tooling surface** (unchanged) — `import { parseDefoldApiDoc, emitDeclarations, DEFOLD_TYPE_MAP, type Vector3, … } from "@defold-ts/types"`. Used internally by `@defold-ts/transpiler` (and later the regen CLI). Source: `packages/types/src/index.ts`.
2. **Engine-globals surface** (new) — added by listing `@defold-ts/types` in a consumer's `tsconfig.json` `compilerOptions.types` array, or via `/// <reference types="@defold-ts/types" />` once. Brings the ambient `vmath` namespace into the global scope. Source: a new `packages/types/index.d.ts` at the package root.

### Engineering decisions recorded here (autonomous, non-grill)

These decisions were made without grilling the user — the non-grill autonomy invariant applies. They are recorded inline so future slices read off the same model:

- **Generated file is a module with `declare global`, not a script-file ambient.** The generated `packages/types/generated/vmath.d.ts` is a real TS module (`export {}` at the end) that wraps its namespace inside `declare global { namespace vmath { … } }`. Engine value types are pulled in via `import type { Vector3, Vector4, … } from "../src/core-types"`. The alternative — making the file a *script* (no imports/exports, top-level `declare namespace` is ambient by accident) — would force `core-types.ts` to also be a script (interface declarations ambient at top level), which means losing the named exports `src/index.ts` and `@defold-ts/transpiler` already use. The module-with-`declare-global` form is the idiomatic modern pattern (e.g. `@types/node`'s global augmentations) and keeps `core-types.ts` untouched.
- **Wrapper helper, not emitter change.** Introduce a new `wrapAsAmbientGlobal(args)` helper in `packages/types/src/publish-dts.ts`. The existing `emitDeclarations` and its snapshot stay untouched — the wrapper is the publishing seam. This separates "describe one namespace" (emitter) from "publish a namespace as a global" (wrapper); future slices that target multiple modules will run the wrapper per namespace.
- **`exports` field uses conditional `types`/`default`.** The package's `exports['.']` becomes `{ "types": "./index.d.ts", "default": "./src/index.ts" }`. TypeScript resolution picks `index.d.ts` (which has the ambient publishing + tooling re-exports); Bun's runtime picks `src/index.ts` (the runtime entry). `tsc --moduleResolution bundler` (the workspace setting) honors this layout. Both entries must re-export the same named symbols, or consumers see a type/runtime drift.
- **Regen as a script, not a CLI command.** A small `packages/types/scripts/regen.ts` does the parser→emitter→wrapper pipeline and writes `generated/vmath.d.ts`. Wired as `"regen": "bun scripts/regen.ts"` in the package's scripts. A drift-guard test re-runs the same pipeline at test time and asserts byte-equality with the committed file. Avoids growing the CLI surface this slice; the `defold-ts regen` CLI command is its own future slice.
- **Consumer proof is type-level, not runtime.** A new `packages/types/test-d/ambient.ts` file uses `vmath.vector3(…)` as a global and asserts the result is assignable to `Vector3`. It has no `import.meta` runtime entry — `bun run typecheck` is the gate. The file lives outside `src/` so it never ships with the published surface; the package's `tsconfig.json` `include` is extended to cover it. The alternative — spinning up a synthetic external workspace that resolves `@defold-ts/types` via the package manager — is correct in spirit but overkill for v1 and is deferred to the slice that publishes a real npm tarball.

### Why not refactor `core-types.ts` into a script-file ambient

Tempting, because it would let `generated/vmath.d.ts` be a pure ambient script with no imports. But the cost is high: `src/index.ts` re-exports `Vector3`/`Vector4`/`Quaternion`/`Matrix4`/`Hash`/`Url`/`Vector` as named module exports, and `@defold-ts/transpiler` already depends on those names. Stripping the exports would force a same-slice transpiler edit; that couples two packages on a slice that should be self-contained. The `declare global` module form pays a 7-line `import type { … } from "../src/core-types"` block at the top of the generated file in exchange for keeping `core-types.ts` and its consumers untouched. Worth it.

## Tests to write first

Co-located per AGENTS.md § Testing (`foo.ts` ↔ `foo.test.ts` in `packages/types/src/`), with the type-level proof and the regen-guard test outside `src/`.

- [ ] `packages/types/src/publish-dts.test.ts` — `wrapAsAmbientGlobal({ namespace: "vmath", emitted: "declare namespace vmath {\n}\n", importsFrom: "../src/core-types" })` returns a string that **does not** contain `import type` (no engine types are referenced), contains `declare global {`, contains `namespace vmath {`, ends with `export {};\n`, and contains no remaining `declare namespace` token (the inner `declare` is stripped).
- [ ] `packages/types/src/publish-dts.test.ts` — wrapping a namespace that uses `Vector3` and `Vector4` (synthetic input: `"declare namespace vmath {\n  function f(): Vector3 | Vector4;\n}\n"`) emits exactly `import type { Vector3, Vector4 } from "../src/core-types";` (sorted, deduplicated, only the referenced types). Tokens that look like engine types but are substrings of other identifiers (`MyVector3Thing`) must **not** be imported — word-boundary matching is part of the contract.
- [ ] `packages/types/src/publish-dts.test.ts` — wrapping a namespace that uses every engine type once imports all seven (`Vector`, `Vector3`, `Vector4`, `Quaternion`, `Matrix4`, `Hash`, `Url`) in deterministic alphabetical order.
- [ ] `packages/types/src/publish-dts.test.ts` — the wrapper's `importsFrom` argument is interpolated verbatim into the import specifier (so future callers can rewrite the path).
- [ ] `packages/types/src/publish-dts.test.ts` — wrapping idempotently survives a trailing-newline-or-not input (`"…}\n"` and `"…}"` produce the same output).
- [ ] `packages/types/test/regen.test.ts` — runs `parseDefoldApiDoc(vmathDoc) → emitDeclarations → wrapAsAmbientGlobal` and asserts the result equals the committed contents of `packages/types/generated/vmath.d.ts` byte-for-byte. Failure mode message: "vmath.d.ts is stale — run `bun run regen` in `packages/types/`".
- [ ] `packages/types/test/regen.test.ts` — `packages/types/generated/vmath.d.ts` parses as syntactically-valid TypeScript via `new Bun.Transpiler({ loader: 'ts' }).scan(content)` (or equivalent) — guards against malformed wrapper output landing.
- [ ] `packages/types/test-d/ambient.ts` — type-level only (compiled by `tsc --noEmit`, never executed). Asserts:
  - `const v: Vector3 = vmath.vector3(1, 2, 3);` type-checks (positional `(x, y, z)` overload returns `Vector3`).
  - `const v0: Vector3 = vmath.vector3();` type-checks (zero-arg overload).
  - `const n: number = vmath.dot(v, v);` type-checks (dot product returns `number`).
  - `const pi: number = vmath.PI;` type-checks (variable export).
  - `// @ts-expect-error` markers cover negative cases: `vmath.vector3("not a number")` and `const bad: string = vmath.PI;` must both fail.
- [ ] **Package-level smoke**: the existing `packages/types/src/core-types.test.ts` and `packages/types/src/emit-dts.test.ts` continue to pass unchanged — the wrapper does not touch the emitter or its snapshot.

## Implementation

1. **Add the wrapper.** Create `packages/types/src/publish-dts.ts`:

   ```ts
   const ENGINE_TYPES = ["Hash", "Matrix4", "Quaternion", "Url", "Vector", "Vector3", "Vector4"] as const;
   type EngineType = (typeof ENGINE_TYPES)[number];

   export interface WrapOptions {
     namespace: string;
     emitted: string;       // raw output of emitDeclarations
     importsFrom: string;   // module specifier for the engine types, e.g. "../src/core-types"
   }

   export function wrapAsAmbientGlobal(opts: WrapOptions): string {
     const used = collectEngineTypes(opts.emitted);
     const importLine =
       used.length === 0
         ? ""
         : `import type { ${used.join(", ")} } from "${opts.importsFrom}";\n\n`;
     const inner = opts.emitted.replace(/^declare\s+namespace\s+/, "namespace ").trimEnd();
     const indented = inner.split("\n").map((l) => (l.length === 0 ? l : `  ${l}`)).join("\n");
     return `${importLine}declare global {\n${indented}\n}\n\nexport {};\n`;
   }

   function collectEngineTypes(emitted: string): EngineType[] {
     return ENGINE_TYPES.filter((t) => new RegExp(`\\b${t}\\b`).test(emitted));
   }
   ```

   Notes for the implementer:
   - `ENGINE_TYPES` is alphabetically pre-sorted so output ordering is deterministic without an extra `.sort()` call. Keep the array in lockstep with `DEFOLD_TYPE_MAP` in `core-types.ts` — a follow-up could derive it from there, but the duplication is intentional for v1 (the wrapper has no runtime dependency on the type map).
   - The `\\b` word-boundary regex prevents `Vector3Foo` from triggering a `Vector3` import.
   - `trimEnd()` + explicit `\n` reconstruction keeps the output free of stray blank lines.

2. **Add the regen script.** Create `packages/types/scripts/regen.ts`:

   ```ts
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
   ```

   - The script is intentionally tiny — every concern (parse, emit, wrap, write) is a single line. No CLI args, no flags. The follow-up CLI slice subsumes this.
   - `import.meta.dir` resolves to `packages/types/scripts`; the parent traversal lands the output at `packages/types/generated/vmath.d.ts`.

3. **Add the regen script to package.json.** Edit `packages/types/package.json`:

   ```json
   "scripts": {
     "build": "tsc -p tsconfig.json",
     "typecheck": "tsc -p tsconfig.json --noEmit",
     "regen": "bun scripts/regen.ts"
   }
   ```

4. **Run the regen script and commit the output.** `mkdir -p packages/types/generated && bun --cwd packages/types run regen`. The committed file `packages/types/generated/vmath.d.ts` is the published surface; the drift-guard test ensures it stays in sync. Expected shape:

   ```ts
   import type { Quaternion, Vector, Vector3, Vector4 } from "../src/core-types";

   declare global {
     namespace vmath {
       const PI: number;
       function dot(v1: Vector3 | Vector4, v2: Vector3 | Vector4): number;
       // … the rest of vmath
     }
   }

   export {};
   ```

   `Hash`/`Url`/`Matrix4` may or may not appear depending on whether the vmath fixture references them — the wrapper decides. (`Quaternion` is present because `vmath.quat` returns it; `Matrix4` is present if any `vmath` symbol references it.)

5. **Add `packages/types/index.d.ts`** at the package root (not inside `src/`):

   ```ts
   import "./generated/vmath";

   export type {
     ApiFunction,
     ApiModule,
     ApiParameter,
     ApiVariable,
   } from "./src/api-doc";
   export { parseDefoldApiDoc } from "./src/api-doc";
   export {
     DEFOLD_TYPE_MAP,
     type Hash,
     type Matrix4,
     type Quaternion,
     type Url,
     type Vector,
     type Vector3,
     type Vector4,
   } from "./src/core-types";
   export { type EmitOptions, emitDeclarations } from "./src/emit-dts";
   export { type WrapOptions, wrapAsAmbientGlobal } from "./src/publish-dts";
   ```

   The side-effect `import "./generated/vmath"` triggers TS to evaluate the `declare global { namespace vmath { … } }` block from the generated module, placing `vmath` in the consumer's global scope. The remaining re-exports mirror what `src/index.ts` exposes today **plus** the new `wrapAsAmbientGlobal` and `WrapOptions` symbols — keeping the tooling surface lossless when consumers resolve via `types` instead of `default`.

6. **Mirror the new exports in `src/index.ts`.** Append:

   ```ts
   export { type WrapOptions, wrapAsAmbientGlobal } from "./publish-dts";
   ```

   Both entries (`index.d.ts` and `src/index.ts`) must expose the same named symbols — a TS-resolution / Bun-runtime mismatch would let consumers compile but crash at runtime.

7. **Update `packages/types/package.json`** with the conditional `exports` and add `index.d.ts` + `generated/**` to the published files (no `files` field today; do not introduce one in this slice — the workspace consumer pattern uses path resolution, not packed tarballs, so it isn't load-bearing yet; add a TODO note):

   ```json
   "exports": {
     ".": {
       "types": "./index.d.ts",
       "default": "./src/index.ts"
     }
   },
   "types": "./index.d.ts"
   ```

   Keep the top-level `"types"` field as well as the conditional — TS resolvers in older bundler-resolution modes fall back to it. Delete the now-redundant `"main": "./src/index.ts"` only if `bun run --filter '*' build` / `bun test` still pass without it; otherwise leave it. (Implementer call — verify by running CI both ways.)

8. **Extend the types package's `tsconfig.json` `include`** so the new files are type-checked:

   ```json
   "include": ["src/**/*.ts", "scripts/**/*.ts", "test-d/**/*.ts", "test/**/*.ts", "index.d.ts", "generated/**/*.d.ts"]
   ```

   `bun run typecheck` (the workspace-level command) now compiles `index.d.ts` + `generated/vmath.d.ts` + `test-d/ambient.ts` together, which is the consumer-side gate.

9. **Add the consumer type-level proof.** Create `packages/types/test-d/ambient.ts`:

   ```ts
   /// <reference path="../index.d.ts" />
   import type { Vector3 } from "../src/core-types";

   const _v: Vector3 = vmath.vector3(1, 2, 3);
   const _v0: Vector3 = vmath.vector3();
   const _n: number = vmath.dot(_v, _v);
   const _pi: number = vmath.PI;

   // @ts-expect-error vmath.vector3 does not accept strings
   vmath.vector3("not a number");

   // @ts-expect-error vmath.PI is a number, not a string
   const _bad: string = vmath.PI;

   // Silence "declared but never used" warnings; this file is type-checked only.
   void _v0;
   void _n;
   void _pi;
   ```

   The `/// <reference path>` triple-slash directive forces TS to load `index.d.ts` (and through it the generated module's `declare global` block) when type-checking this file. `import type { Vector3 }` is the *explicit-import* path; the bare `vmath.vector3(…)` calls are the *ambient* path. Both must work, and a single test file proves both.

10. **Add the wrapper tests.** Create `packages/types/src/publish-dts.test.ts` per the "Tests to write first" list above. Use `bun:test`'s `test`/`expect` API (same pattern as the existing `api-doc.test.ts` and `emit-dts.test.ts`).

11. **Add the regen-guard test.** Create `packages/types/test/regen.test.ts` and `mkdir -p packages/types/test` if needed (the project's testing convention is co-location, but a regen-guard that reads multiple modules is *integration-shaped* and belongs in a `test/` sibling — AGENTS.md does not forbid this). It loads the fixture, runs the full pipeline, and reads `packages/types/generated/vmath.d.ts` from disk for the byte-equality assertion. Use `Bun.file("…").text()` for the read.

12. **Run `ci` to green.** From the repo root: `bun run typecheck && bun run lint && bun test`. All three must exit 0. Expect Biome to flag the new `index.d.ts` for `noUnusedImports` on the side-effect `import "./generated/vmath";` — if it does, add a targeted `biome-ignore` comment on that line with the justification "side-effect import loads the ambient `vmath` namespace declaration". Do not relax Biome globally.

### Key references

- `packages/types/src/emit-dts.ts` — emitter that produces the `declare namespace vmath { … }` block the wrapper consumes; its output format is fixed and the wrapper is the only place that transforms it.
- `packages/types/src/core-types.ts` — `DEFOLD_TYPE_MAP` lists the engine value types; the wrapper's `ENGINE_TYPES` array must stay in lockstep (TODO comment in `publish-dts.ts` references this).
- `packages/types/fixtures/vmath_doc.json` — input to the regen script.
- `packages/transpiler/package.json` — already declares `"@defold-ts/types": "workspace:*"`; after this slice the transpiler can `import type { Vector3 } from "@defold-ts/types"` AND see `vmath` ambient when type-checking transpiled user code (use `vmath` ambient is exercised by `test-d/ambient.ts`, not by the transpiler yet).
- `tsconfig.json` (root) — `verbatimModuleSyntax: true` requires `import type` for type-only re-exports; the new `publish-dts.ts` and `index.d.ts` must satisfy it without `as`-casts.
- `biome.json` — `useImportType: error` and (likely) `noUnusedImports` shape the allowed forms; expect a single `biome-ignore` on the side-effect import in `index.d.ts`.
- AGENTS.md § Layout invariants — `packages/types` is "typings only, no runtime code." This slice adds runtime in `scripts/regen.ts` and the existing parser/emitter; the invariant is interpreted as "the *published consumer surface* is typings-only", not "no `.ts` files run in this workspace." Recording the interpretation here so a future reader doesn't mis-flag the regen script.

## Definition of done

- `packages/types/src/publish-dts.ts` exists and exports `wrapAsAmbientGlobal` and `WrapOptions`.
- `packages/types/src/publish-dts.test.ts` exists with the five wrapper test cases above, all passing under `bun test`.
- `packages/types/scripts/regen.ts` exists and writes `packages/types/generated/vmath.d.ts` when invoked via `bun --cwd packages/types run regen`.
- `packages/types/generated/vmath.d.ts` exists, is the committed output of the regen script, and is byte-equal to a fresh run of the pipeline (drift-guard test passes).
- `packages/types/test/regen.test.ts` exists with the byte-equality and TS-syntax-valid assertions, both passing.
- `packages/types/index.d.ts` exists at the package root with the side-effect import + tooling re-exports listed in step 5.
- `packages/types/test-d/ambient.ts` exists and type-checks under `bun run typecheck` (the `// @ts-expect-error` markers stay in place — removing them must cause a failure).
- `packages/types/package.json` has the conditional `exports['.']` block and the top-level `"types": "./index.d.ts"`; `scripts.regen` is wired.
- `packages/types/src/index.ts` re-exports `wrapAsAmbientGlobal` and `WrapOptions` so the runtime entry and the types entry agree on the public surface.
- `packages/types/tsconfig.json` `include` covers `src/**/*.ts`, `scripts/**/*.ts`, `test-d/**/*.ts`, `test/**/*.ts`, `index.d.ts`, and `generated/**/*.d.ts`.
- `bun run typecheck`, `bun run lint`, and `bun test` all exit 0 from the repo root.
- No new top-level dependencies. The wrapper is hand-rolled string manipulation; the regen script uses only `node:fs`/`node:path` (already available) plus the existing in-package modules.
- Out of scope (deferred to follow-up slices, do not creep): multi-module fan-out (`msg`, `hash`, `go`, etc.); a `defold-ts regen` CLI command (subsumes the in-package script); a real external-consumer test that resolves `@defold-ts/types` from a synthetic workspace via the package manager; refactoring `core-types.ts` into a script-file ambient; emitting JSDoc comments from `ApiFunction.description`; the lifecycle-hook `self`-shape slice; tightening the `table` / `function` type mappings.
