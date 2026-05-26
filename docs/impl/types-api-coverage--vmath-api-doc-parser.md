# Step: vmath API doc fixture & parser

Status: shipped
Goal: types-api-coverage
PRD: docs/prd/vision.md#types-api-coverage
Branch: `step/types-api-coverage--vmath-api-doc-parser`
Done when: `packages/types/src/api-doc.ts` contains `export function parseDefoldApiDoc`

## Context

The `types-api-coverage` goal mandates an **auto-generation pipeline** rather than hand-maintained typings — Defold's surface is too large (`go`, `gui`, `msg`, `vmath`, `render`, `physics`, `sound`, `sys`, `http`, …) to keep aligned by hand. Before we can generate `.d.ts`, we need two things in the repo:

1. A **vendored snapshot** of Defold's published API doc shape for at least one module, so the parser has something stable to chew on and snapshot-test against. Defold publishes per-module `*_doc.json` artifacts generated from engine source (the same files that power the published reference at <https://defold.com/ref/>). They live under the Defold release artifacts and are also reachable from the `defold/defold` repository's docs build output. Each file has roughly this shape (verified at planning time against the public reference, exact field names confirmed during implementation):

   ```jsonc
   {
     "info": { "namespace": "vmath", "name": "Vector math", "brief": "...", "description": "..." },
     "elements": [
       {
         "type": "FUNCTION",
         "name": "vmath.vector3",
         "brief": "creates a new vector",
         "description": "...",
         "parameters": [
           { "name": "x", "doc": "x coordinate", "types": ["number"] }
         ],
         "returnvalues": [
           { "name": "v", "doc": "new vector", "types": ["vector3"] }
         ],
         "examples": "..."
       },
       { "type": "VARIABLE", "name": "vmath.PI", "...": "..." }
     ]
   }
   ```

   The implementation step must verify the exact field names against the real fixture and adjust the parser accordingly — this Context describes the **shape we expect**, not a contract.

2. A **typed parser** (`parseDefoldApiDoc`) that converts the JSON into an `ApiModule` in-memory representation. This is the seam every later step builds on: the `.d.ts` emitter, the lifecycle-hook step, the multi-module fan-out, and the regen script all consume `ApiModule`.

`vmath` is chosen as the first target because it is pure value math (no engine context, no `self` shape, no cross-module references) and is small enough (~30 symbols) to verify the round-trip end to end.

## Tests to write first

Co-located per the project's testing convention (`foo.ts` ↔ `foo.test.ts` in `packages/types/src/`):

- [ ] `packages/types/src/api-doc.test.ts` — `parseDefoldApiDoc` parses the `vmath` fixture without throwing and returns an object with `namespace === "vmath"`.
- [ ] `packages/types/src/api-doc.test.ts` — the parsed model includes function entries named `vmath.vector3`, `vmath.vector4`, `vmath.quat`, `vmath.dot`, `vmath.cross`, `vmath.length`, `vmath.normalize` (subset assertion — Defold may add more; missing any of these is a regression).
- [ ] `packages/types/src/api-doc.test.ts` — `vmath.vector3` parses to a function with three numeric parameters (`x`, `y`, `z`) and a `vector3` return type.
- [ ] `packages/types/src/api-doc.test.ts` — given a JSON object that is not a Defold API doc (e.g. `{}` or `{ "info": null }`), `parseDefoldApiDoc` throws an `Error` whose message names the offending field (so failures during regen are diagnosable, not silent).
- [ ] `packages/types/src/api-doc.test.ts` — every `ApiFunction` in the parsed model carries non-empty `name`, `parameters` (possibly `[]`), and `returnValues` (possibly `[]`) arrays; no `undefined` leaks (guarded by `noUncheckedIndexedAccess`).

## Implementation

1. **Vendor the fixture.** Add `packages/types/fixtures/vmath_doc.json`. Source: Defold's published reference doc for `vmath`. Acceptable sources, in priority order:
   - the `*_doc.json` artifact from a tagged Defold release (preferred — pin the Defold version in a sibling `packages/types/fixtures/README.md` so regen is reproducible);
   - the same file fetched from the `defold/defold` repository at a pinned commit;
   - if neither is reachable at implementation time, hand-write a minimal but real-shaped JSON file using the public reference pages as ground truth, and record that fallback in `packages/types/fixtures/README.md` so the next step can replace it with a real upstream snapshot.

2. **Define the in-memory model.** In `packages/types/src/api-doc.ts`, export:

   ```ts
   export interface ApiModule {
     namespace: string;
     brief: string;
     description: string;
     functions: ApiFunction[];
     variables: ApiVariable[];
   }

   export interface ApiFunction {
     name: string;
     brief: string;
     description: string;
     parameters: ApiParameter[];
     returnValues: ApiParameter[];
   }

   export interface ApiParameter {
     name: string;
     doc: string;
     types: string[]; // raw Defold type tokens, mapped to TS in a later step
   }

   export interface ApiVariable {
     name: string;
     brief: string;
     description: string;
     types: string[];
   }
   ```

   Use `readonly` arrays only if it falls out cleanly — do not contort the model. Keep this file pure data + the one parse function; no I/O, no fs reads.

3. **Implement `parseDefoldApiDoc(input: unknown): ApiModule`.** Validate the input shape defensively (it is external data). Required guarantees:
   - reject non-objects with a clear `Error` ("expected object, got …");
   - reject missing `info.namespace` with a clear `Error`;
   - tolerate an empty `elements` array (returns a module with empty `functions`/`variables`);
   - dispatch on `element.type === "FUNCTION"` vs `"VARIABLE"` and ignore other element kinds (Defold occasionally adds `MESSAGE`, `PROPERTY`, etc. — out of scope for this step; a follow-up step extends the model).
   - never `as`-cast unchecked input — narrow via runtime checks so `strict` + `noUncheckedIndexedAccess` are satisfied.

4. **Wire the test fixture loader.** Tests load the fixture with `import vmathDoc from "../fixtures/vmath_doc.json" with { type: "json" }` (Bun supports JSON imports natively under `resolveJsonModule: true`, already enabled in `tsconfig.json`). Avoid `fs.readFileSync` so the test is workspace-portable.

5. **Update `packages/types/src/index.ts`** to export the parser and types:

   ```ts
   export { parseDefoldApiDoc } from "./api-doc";
   export type { ApiModule, ApiFunction, ApiParameter, ApiVariable } from "./api-doc";
   ```

   Remove the placeholder `export {}` once a real export exists.

6. **Run `ci` to green.** `bun run typecheck && bun run lint && bun test --pass-with-no-tests` — all three must pass. `--pass-with-no-tests` is a no-op once these tests land; it remains in the ci `## Commands` purely for the empty-test bootstrap window.

### Key references

- `packages/types/src/index.ts` — currently `export {}`; this step replaces it.
- `packages/types/tsconfig.json` — strict settings already enforce `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- `biome.json` — `useImportType: error` means the index re-export must use `export type` for the interfaces.
- `AGENTS.md` § Testing — "co-locate unit tests next to the source: `foo.ts` ↔ `foo.test.ts`" (drives the test file path).
- Defold API reference: <https://defold.com/ref/stable/vmath/> — ground truth for what the fixture must describe.

## Definition of done

- `packages/types/fixtures/vmath_doc.json` exists with a real-shaped Defold API doc for `vmath` (source + Defold version recorded in `packages/types/fixtures/README.md`).
- `packages/types/src/api-doc.ts` exists and exports `parseDefoldApiDoc`, `ApiModule`, `ApiFunction`, `ApiParameter`, `ApiVariable`.
- `packages/types/src/api-doc.test.ts` exists with the five test cases above and all pass under `bun test`.
- `packages/types/src/index.ts` re-exports the parser and types; the placeholder `export {}` is gone.
- `bun run typecheck`, `bun run lint`, and `bun test --pass-with-no-tests` all exit 0 from the repo root.
- No new top-level dependencies added — `parseDefoldApiDoc` is hand-rolled validation, not a schema-library wrapper.
