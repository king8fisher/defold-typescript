# Step: vmath .d.ts emitter

Status: planned
Goal: types-api-coverage
PRD: docs/prd/vision.md#types-api-coverage
Branch: `step/types-api-coverage--vmath-dts-emitter`
Done when: `packages/types/src/emit-dts.ts` contains `export function emitDeclarations`

## Context

The previous slice ([types-api-coverage--vmath-api-doc-parser.md](types-api-coverage--vmath-api-doc-parser.md)) stops at an in-memory `ApiModule`. Nothing consumes it yet, so end users get no autocomplete from `@defold-ts/types`. This step adds the **first consumer**: a pure function that converts `ApiModule` into a TypeScript declaration string.

The emitter is the seam every downstream step plugs into:

- the multi-module fan-out (`go`, `gui`, `msg`, `render`, …) calls the same emitter with different `ApiModule`s;
- the regen CLI command writes the emitter output to `packages/types/generated/<ns>.d.ts`;
- the lifecycle-hook step extends the emitter to emit per-script `self` interfaces.

Wiring the emitted `.d.ts` into the package's published `types` field — so user code actually sees the `vmath` global — is **out of scope here**; that wiring (package layout, ambient-vs-module declaration, `index.d.ts` triple-slash reference) is its own slice. This step lands the emitter as a snapshot-tested pure function only.

### Type mapping

Defold's API doc uses raw type tokens (`number`, `string`, `vector3`, `quat`, `matrix4`, `table`, `function`, `hash`, `url`, `boolean`). The emitter maps them to TypeScript via a hand-curated table — auto-deriving the engine value types from the JSON doc is impractical (the doc describes call signatures, not the field shapes of `vector3`, `quat`, etc.).

| Defold token | TS type                          | Notes                                                   |
| ------------ | -------------------------------- | ------------------------------------------------------- |
| `number`     | `number`                         |                                                         |
| `string`     | `string`                         |                                                         |
| `boolean`    | `boolean`                        |                                                         |
| `table`      | `Record<string \| number, unknown>` | Defold tables are heterogeneous; tighten in a later slice |
| `function`   | `(...args: unknown[]) => unknown` | Tighten per-call-site in a later slice                  |
| `vector`     | `Vector`                         | Hand-declared in `core-types.ts`                        |
| `vector3`    | `Vector3`                        | Hand-declared in `core-types.ts`                        |
| `vector4`    | `Vector4`                        | Hand-declared in `core-types.ts`                        |
| `quat`       | `Quaternion`                     | Hand-declared in `core-types.ts`                        |
| `matrix4`    | `Matrix4`                        | Hand-declared in `core-types.ts`                        |
| `hash`       | `Hash`                           | Hand-declared (placeholder branded type)                |
| `url`        | `Url`                            | Hand-declared (placeholder branded type)                |
| anything else | `unknown`                       | Fall-through; the next regen surfaces unmapped tokens   |

Multi-type tokens on one parameter (e.g. `types: ["number", "vector3"]`) emit as a union (`number | Vector3`).

### Multi-return and overloads

Defold's doc emits **separate FUNCTION entries** for overloads — `vmath.vector3()`, `vmath.vector3(n)`, and `vmath.vector3(x, y, z)` are three entries. The emitter mirrors that: each `ApiFunction` → one TS function signature. TS's natural overload merging inside a `declare namespace` block handles the rest.

Multi-return (`returnvalues.length > 1`) does **not** appear in the vmath surface and is **out of scope** for this slice. The emitter emits the first return value's type only and records the gap with a `// TODO multi-return` comment; a follow-up slice introduces a `LuaMultiReturn<[…]>` wrapper once `typescript-to-lua` is wired into the transpiler package.

### Why core types are hand-written, not generated

`Vector3` has `.x`, `.y`, `.z`. That information is only available in the prose `info.description` of `vmath_doc.json` (a markdown block listing the components), not in any structured field. Parsing that prose reliably is a separate problem. The pragmatic move is to hand-write the ~6 core engine value types once — they are stable across Defold releases — and let the emitter reference them by name.

## Tests to write first

All co-located in `packages/types/src/` per the AGENTS.md convention.

- [ ] `packages/types/src/core-types.test.ts` — `Vector3` is assignable to `{ x: number; y: number; z: number }` (compile-only check via a `satisfies` expression on a literal). Catches accidental field renames.
- [ ] `packages/types/src/core-types.test.ts` — `DEFOLD_TYPE_MAP` maps the expected Defold tokens to the expected TS identifiers (table-driven assertion over the rows in the Context table above).
- [ ] `packages/types/src/emit-dts.test.ts` — `emitDeclarations` on an empty `ApiModule` (no functions, no variables) emits exactly `declare namespace foo {\n}\n` (or equivalent normalized form — assert via string equality, not regex).
- [ ] `packages/types/src/emit-dts.test.ts` — emit of the vmath fixture (loaded via `parseDefoldApiDoc(vmathDoc)`) **contains** `declare namespace vmath {`, contains `function vector3(): Vector3;`, contains `function vector3(x: number, y: number, z: number): Vector3;`, and contains `function dot(v1: Vector3, v2: Vector3): number;`.
- [ ] `packages/types/src/emit-dts.test.ts` — a function with `types: ["number", "vector3"]` on a parameter emits `number | Vector3` (synthetic `ApiModule`, not via the fixture, so the union case is unambiguous).
- [ ] `packages/types/src/emit-dts.test.ts` — a function with an unknown Defold type token (`types: ["frobnicator"]`) emits `unknown` and does **not** throw.
- [ ] `packages/types/src/emit-dts.test.ts` — variables emit as `const PI: number;` inside the namespace.
- [ ] `packages/types/src/emit-dts.test.ts` — full vmath emit snapshot via `expect(out).toMatchSnapshot()` against `packages/types/src/__snapshots__/emit-dts.test.ts.snap`. Snapshot is the regression net for the whole pipeline; future Defold version bumps will diff against it intentionally.

## Implementation

1. **Add `packages/types/src/core-types.ts`.** Export the six engine value interfaces:

   ```ts
   export interface Vector { readonly [index: number]: number; readonly length: number; }
   export interface Vector3 { x: number; y: number; z: number; }
   export interface Vector4 { x: number; y: number; z: number; w: number; }
   export interface Quaternion { x: number; y: number; z: number; w: number; }
   export interface Matrix4 { /* m00..m33 fields; c0..c3 column accessors return Vector4 */ }
   export interface Hash { readonly __hashBrand: unique symbol; }
   export interface Url { readonly socket: Hash; readonly path: Hash; readonly fragment: Hash | undefined; }
   ```

   Also export `DEFOLD_TYPE_MAP: ReadonlyRecord<string, string>` with the rows from the Context table. Use `as const` + `satisfies` to keep the table typed without a runtime cast. Defold's `Matrix4` field shape is `m00`..`m33` row-major (verify against the `info.description` prose in `vmath_doc.json` during implementation); for v1 declare the full 16 numeric fields plus `c0..c3: Vector4` column accessors.

2. **Add `packages/types/src/emit-dts.ts`.** Export one function:

   ```ts
   export function emitDeclarations(module: ApiModule, options?: EmitOptions): string;
   export interface EmitOptions {
     mapType?: (defoldType: string) => string;
   }
   ```

   Defaults:
   - `mapType` falls back to `DEFOLD_TYPE_MAP[token] ?? "unknown"` (`Object.hasOwn` guard for `noUncheckedIndexedAccess`).
   - Output is a single string ending with a trailing newline.
   - Function/variable names have their `<namespace>.` prefix stripped before emission (`vmath.vector3` → `vector3`); functions whose stripped name is not a valid TS identifier are skipped with a `// skipped: <reason>` line (no entry in the vmath fixture triggers this, but it must not crash).

3. **Emission order** inside the namespace block, deterministic for snapshot stability:
   1. variables, sorted alphabetically by stripped name;
   2. functions, sorted alphabetically by stripped name, then by parameter count (preserves the natural overload order: `vector3()` before `vector3(n)` before `vector3(x,y,z)`).

4. **Multi-type union emission.** A parameter with `types.length > 1` emits as `T1 | T2 | …` after mapping each token. Deduplicate after mapping (two Defold tokens that both map to `unknown` should not emit `unknown | unknown`). Return values follow the same rule, except multi-return (`returnValues.length > 1`) emits only the first return's type and a `// TODO multi-return` comment on the same line (out of scope for this slice — see Context).

5. **Variable emission.** `const <name>: <T>;`, where `<T>` is the mapped first type token, or `unknown` if `types` is empty.

6. **Wire exports.** Append to `packages/types/src/index.ts`:

   ```ts
   export { emitDeclarations } from "./emit-dts";
   export type { EmitOptions } from "./emit-dts";
   export {
     DEFOLD_TYPE_MAP,
     type Vector,
     type Vector3,
     type Vector4,
     type Quaternion,
     type Matrix4,
     type Hash,
     type Url,
   } from "./core-types";
   ```

   `biome.json`'s `useImportType: error` forces the `type` modifiers above.

7. **Run `ci` to green.** `bun run typecheck`, `bun run lint`, `bun test` — all three exit 0 from the repo root.

### Key references

- `packages/types/src/api-doc.ts` — `ApiModule`/`ApiFunction`/`ApiParameter`/`ApiVariable` shape the emitter consumes.
- `packages/types/src/api-doc.test.ts` — pattern for loading the vmath fixture via `import vmathDoc from "../fixtures/vmath_doc.json" with { type: "json" }`.
- `packages/types/fixtures/vmath_doc.json` — `info.description` block lists the component fields for `vector3`, `vector4`, `quat`, `matrix4`, `vector` (ground truth for the hand-written core types).
- `AGENTS.md` § Testing — co-locate `foo.ts` ↔ `foo.test.ts`; snapshot output rather than asserting on substrings (the `toMatchSnapshot()` test is the canonical regression net).
- `tsconfig.json` — `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax` all on; the emitter and the type map must satisfy them without `as`-casts.

## Definition of done

- `packages/types/src/core-types.ts` exists and exports `Vector`, `Vector3`, `Vector4`, `Quaternion`, `Matrix4`, `Hash`, `Url`, `DEFOLD_TYPE_MAP`.
- `packages/types/src/core-types.test.ts` exists and asserts the field shape and the type-map rows.
- `packages/types/src/emit-dts.ts` exists and exports `emitDeclarations` and `EmitOptions`.
- `packages/types/src/emit-dts.test.ts` exists with the eight test cases above; the snapshot file `packages/types/src/__snapshots__/emit-dts.test.ts.snap` is committed.
- `packages/types/src/index.ts` re-exports the emitter, the options type, the core types, and the type map.
- `bun run typecheck`, `bun run lint`, and `bun test` all exit 0 from the repo root.
- No new top-level dependencies — the emitter is pure string concatenation, not a code-generation library wrapper.
- Out of scope (deferred to follow-up slices, do not creep): multi-return (`LuaMultiReturn<[…]>`), JSDoc comment emission from `description`, regen CLI command, package-level `.d.ts` wiring so consumers see the `vmath` global, additional modules (`go`/`gui`/`msg`/…).
