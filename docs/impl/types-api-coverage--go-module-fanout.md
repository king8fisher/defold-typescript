# Step: go module fan-out

Status: shipped
Goal: types-api-coverage
PRD: docs/prd/vision.md#types-api-coverage
Branch: `step/types-api-coverage--go-module-fanout`
Done when: `packages/types/generated/go.d.ts` exists, the drift-guard tests pass for `go`, and `test-d/ambient.ts` exercises `go.get_position`, `go.get_rotation`, `go.get_id`, and `go.set_position(vmath.vector3(...), _id)`

## Context

The msg-fanout slice generalised the regen pipeline to a `MODULE_MANIFEST` (`packages/types/scripts/regen.ts`) and made every drift-guard / parity / TS-syntax test loop over that manifest (`packages/types/test/regen.test.ts`). Adding a new module is now purely additive: one fixture file + one manifest row + one side-effect import + a handful of test-d assertions. No pipeline edits.

This slice adds **`go`** — the game-object namespace — as the third module. Three reasons it is the right next pick:

1. Defold's most-used surface. Almost every Defold script calls `go.get_position`, `go.set_position`, `go.get_id`, `go.delete`, `go.animate`, etc. Typing `go` unlocks autocomplete and error checking for the majority of real script code.
2. Engine-type reference breadth. `go.get_position` returns `vector3`, `go.get_rotation` returns `quaternion`, `go.get_id` returns `hash`, `go.exists` takes `url`. This exercises `wrapAsAmbientGlobal`'s engine-type detection (`packages/types/src/publish-dts.ts`) on four reference types from a single module — broader than vmath (vector3/vector4/quat/matrix4 only) and msg (url/hash only).
3. Larger surface (~25+ functions, ~30+ `PLAYBACK_*` / `EASING_*` enum variables). Proves the pipeline scales past the small msg surface (~4 functions) without further code edits.

The `go` API doc contains `VARIABLE` elements for `PLAYBACK_ONCE_FORWARD`, `EASING_INOUTQUAD`, etc., whose `types` array is `["constant"]`. `constant` is not in `DEFOLD_TYPE_MAP`, so `defaultMapType` (`packages/types/src/emit-dts.ts`) returns `"unknown"` for them — they emit as `const PLAYBACK_ONCE_FORWARD: unknown;`. That is acceptable for this slice; tightening enum typing is a follow-up slice, not part of fan-out.

`go.animate`'s `easing` parameter and `go.property`'s `value` parameter both have union types that include `constant`. Per the emitter's de-dup rule (`unionFromTokens` in `emit-dts.ts`), `["constant", "vector3", "vector4"]` becomes `"unknown | Vector3 | Vector4"` — visually noisy but type-correct, and structurally identical to today's `nil`-bearing unions in `msg.post`. No emitter change required.

Out of scope (deferred): top-level globals (`hash(s)`, `pprint`); enum tightening (replacing `unknown` with literal-type unions for `PLAYBACK_*` / `EASING_*`); lifecycle hooks and per-script `self` shapes; further namespace fan-out (`gui`, `render`, `physics`, `sound`, `sys`, `http`); JSDoc emission from `description` fields; multi-return tuple typing.

## Tests to write first

Co-located per AGENTS.md § Testing. The existing `packages/types/test/regen.test.ts` already loops over `MODULE_MANIFEST` for byte-equality, TS-syntax-valid, and manifest-vs-disk parity — those tests pick up the new `go` entry automatically once it lands in the manifest and `generated/go.d.ts` is committed. The only new assertions are consumer-facing in `test-d/ambient.ts`:

- [ ] `packages/types/test-d/ambient.ts` — `const p: Vector3 = go.get_position();` type-checks (return is `Vector3`).
- [ ] `packages/types/test-d/ambient.ts` — `const r: Quaternion = go.get_rotation();` type-checks (return is `Quaternion`).
- [ ] `packages/types/test-d/ambient.ts` — `const id: Hash = go.get_id();` type-checks (return is `Hash`).
- [ ] `packages/types/test-d/ambient.ts` — `go.set_position(vmath.vector3(1, 2, 3));` type-checks (parameter accepts a `Vector3` produced by another typed namespace, proving cross-module wiring).
- [ ] `packages/types/test-d/ambient.ts` — `// @ts-expect-error` covers `go.set_position("not a vector")` (parameter is `Vector3`, not `string`).
- [ ] `packages/types/test-d/ambient.ts` — `// @ts-expect-error` covers `const _bad: string = go.get_position();` (return is `Vector3`, not `string`).

If the actual generated signatures diverge from these expectations after step 1 (e.g. `go.get_position` requires an `id` argument because the Defold doc does not mark it `nil`), update the assertions to the real signatures and proceed — the test-d's job is to prove the types reach the consumer, not to specify them.

## Implementation

1. **Vendor the go fixture.** The `go` API doc lives in `ref-doc.zip` under a path that includes `script` and the gameobject sources. Verify the exact name before extracting:

   ```sh
   curl -L https://github.com/defold/defold/releases/download/1.12.4/ref-doc.zip -o /tmp/ref-doc.zip
   unzip -l /tmp/ref-doc.zip | grep -i 'script.*doc.json'
   ```

   The expected entry is `doc/src-script_gameobject.cpp_doc.json` (the `info.namespace` field inside is `"go"`, regardless of the filename). Extract it:

   ```sh
   unzip -p /tmp/ref-doc.zip doc/src-script_gameobject.cpp_doc.json > packages/types/fixtures/go_doc.json
   ```

   If `unzip -l` shows a different filename for the gameobject doc, use that path instead and record it in the fixtures README. Append a `## go_doc.json` section to `packages/types/fixtures/README.md` mirroring the existing `## msg_doc.json` entry (same Defold 1.12.4 pin, same source-zip recipe with the new `unzip -p` path).

2. **Add the manifest entry.** Edit `packages/types/scripts/regen.ts`:

   ```ts
   import goDoc from "../fixtures/go_doc.json" with { type: "json" };
   ```

   And insert into `MODULE_MANIFEST` in alphabetical order by `namespace` (the existing convention from the msg-fanout slice):

   ```ts
   export const MODULE_MANIFEST: readonly ModuleManifestEntry[] = [
     { namespace: "go", doc: goDoc, outFile: "go.d.ts" },
     { namespace: "msg", doc: msgDoc, outFile: "msg.d.ts" },
     { namespace: "vmath", doc: vmathDoc, outFile: "vmath.d.ts" },
   ];
   ```

3. **Regenerate and commit.** From `packages/types/`, run `bun run regen`. It writes `generated/go.d.ts`; `generated/msg.d.ts` and `generated/vmath.d.ts` stay byte-stable (the manifest order does not affect their content). Commit the new file.

4. **Add the side-effect import.** Edit `packages/types/index.d.ts` and insert `import "./generated/go";` alphabetically before the existing `msg` import:

   ```ts
   import "./generated/go";
   import "./generated/msg";
   import "./generated/vmath";
   ```

5. **Extend `test-d/ambient.ts`** with the `go` assertions listed in "Tests to write first". `Vector3`, `Quaternion`, and `Hash` are already in `packages/types/src/core-types`; add `Quaternion` and `Hash` to the existing `import type` line at the top of `ambient.ts` (`Vector3` is already imported). Use `vmath.vector3(...)` to construct the argument for `go.set_position` — that is the cross-module wiring proof.

6. **Run ci to green.** From the repo root: `bun run typecheck && bun run lint && bun test`. Expected gotchas:
   - The drift-guard test will fail loudly if step 3 was skipped or the manifest order does not match disk alphabetical — that is the test's intended behavior.
   - Biome's `useImportType` may flag the new `Quaternion` / `Hash` imports if they are mistakenly added without `type`; the existing `import type` line is the correct home.
   - If the `go` doc has a function whose name contains a hyphen or starts with a digit (it should not, but defensively), `prepareFunction` (`emit-dts.ts`) filters it via `TS_IDENTIFIER`. The function is silently dropped; surface it in the implementer's report rather than working around it here.
   - The `go` namespace name is not a TypeScript reserved word; `declare namespace go { ... }` compiles cleanly.

## Key references

- `packages/types/scripts/regen.ts` — current manifest with `msg` + `vmath`; this slice inserts one row.
- `packages/types/test/regen.test.ts` — manifest-driven drift-guard; no change, covers the new entry automatically.
- `packages/types/index.d.ts` — current two side-effect imports; this slice adds a third.
- `packages/types/test-d/ambient.ts` — current `vmath` + `msg` proof; this slice appends `go` assertions and adds `Quaternion`, `Hash` to the type import.
- `packages/types/src/core-types.ts` — already exports `Vector3`, `Quaternion`, `Hash`, `Url`; no change.
- `packages/types/src/publish-dts.ts` — `wrapAsAmbientGlobal` engine-type detection (word-boundary regex) already covers `Vector3`, `Quaternion`, `Hash`, `Url`; no change.
- `packages/types/src/emit-dts.ts` — `defaultMapType` returns `unknown` for unmapped tokens (`constant`, etc.); no change.
- `packages/types/fixtures/README.md` — append `## go_doc.json` mirroring the `## msg_doc.json` entry.
- Defold API reference: <https://defold.com/ref/stable/go/> — ground truth for what the fixture must describe.

## Divergences from plan (recorded at implement time)

- **Fixture path**: the `go` doc lives at `doc/gameobject_script.cpp_doc.json` inside `ref-doc.zip` (not `doc/src-script_gameobject.cpp_doc.json` as the plan guessed). The file's `info.namespace` is still `"go"`. `fixtures/README.md` records the real path.
- **`go.delete` collides with a TS reserved word.** `prepareFunction` in `emit-dts.ts` only rejects non-identifier names via `TS_IDENTIFIER`; `delete` passes that regex but `declare namespace go { function delete(...) }` is a syntax error. The plan's "out of scope: emitter changes" was strict, so the reserved-name filter lives in `scripts/regen.ts` instead of `src/emit-dts.ts` and is shared between the CLI entry-point and the drift-guard test via `generateModuleDeclaration`. Dropped: `go.delete`. Renaming and re-exposing it under a TS-legal alias is a follow-up.
- **`is_optional: True` is ignored by the emitter.** `emitParameter` only marks a param as `?:` when `nil` is in its `types` array. The `go` doc uses `is_optional` for the `id` parameter on `get_position`/`get_rotation`/`set_position`/etc.; none carry `nil`, so all of those `id` arguments are emitted as required. The test-d uses `go.get_id("/my_object")` to obtain a `Hash` and passes it explicitly. Honoring `is_optional` is a separate emitter slice.
- **Test-d signatures updated**: `go.get_id` requires `path: string`; `go.get_position`/`get_rotation` require `id`; `go.set_position` is `(position, id)` with both required given the point above.

## Definition of done

- `packages/types/fixtures/go_doc.json` exists, sourced from the same Defold 1.12.4 `ref-doc.zip` used for vmath and msg, with the source path recorded in `packages/types/fixtures/README.md`.
- `packages/types/scripts/regen.ts` has a `MODULE_MANIFEST` entry `{ namespace: "go", doc: goDoc, outFile: "go.d.ts" }` in alphabetical order.
- `packages/types/generated/go.d.ts` exists as the committed wrapper output and is byte-equal to a fresh regen run.
- `packages/types/generated/msg.d.ts` and `packages/types/generated/vmath.d.ts` are byte-stable (no diff from before this slice).
- `packages/types/index.d.ts` side-effect-imports `./generated/go`, `./generated/msg`, `./generated/vmath` in alphabetical order.
- `packages/types/test-d/ambient.ts` exercises `go.get_id("/my_object")`, `go.get_position(_id)`, `go.get_rotation(_id)`, `go.set_position(vmath.vector3(...), _id)`, and the two `// @ts-expect-error` negatives (real signatures require `id`; see Divergences).
- `bun run typecheck`, `bun run lint`, and `bun test` all exit 0 from the repo root.
- No changes to `packages/transpiler`, `packages/cli`, or any file under `packages/types/src/` (the reserved-name filter lives in `packages/types/scripts/regen.ts`, not `src/`).
- No new top-level dependencies.
