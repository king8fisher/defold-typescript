# Vision

## Vision

Authoring Defold games in TypeScript should feel indistinguishable from authoring a modern TypeScript app: instant feedback, agent-driven scaffolding, no manual Lua glue, no five-repo coordination. We replace [ts-defold](https://github.com/ts-defold) by collapsing its fragmented tooling into one Bun monorepo, then push past it on speed, types, and AI ergonomics.

## Goals

### types-api-coverage
- **Status**: in-progress
- **Why**: Defold's Lua APIs (`go`, `gui`, `msg`, `vmath`, `render`, `physics`, `sound`, `sys`, `http`, etc.) must round-trip through TypeScript with accurate signatures so users get autocomplete and error checking for the engine surface.
- **What**:
  - All public Defold script-context APIs typed under `packages/types`
  - Lifecycle hooks (`init`, `update`, `on_message`, `on_input`, `final`) typed with correct `self` shapes
  - Module exported as `@defold-ts/types`, consumable via a single `import type` from user code
  - Auto-generation pipeline that pulls from the Defold API reference, not hand-maintained
- **Depends on**: none
- **Impl**:
  - [types-api-coverage--vmath-api-doc-parser.md](../impl/types-api-coverage--vmath-api-doc-parser.md) — first slice: vendor the Defold API doc for `vmath` and parse it into a typed model (foundation for the auto-generation pipeline)
  - [types-api-coverage--vmath-dts-emitter.md](../impl/types-api-coverage--vmath-dts-emitter.md) — second slice: emit a TypeScript `declare namespace vmath { … }` string from the parsed `ApiModule`, with a hand-curated Defold→TS type mapping for `vector3`/`vector4`/`quat`/`matrix4`
  - [types-api-coverage--vmath-package-publish.md](../impl/types-api-coverage--vmath-package-publish.md) — third slice: publish the emitter output through the `@defold-ts/types` package so end-user `.ts` scripts see `vmath` as a typed ambient global (regen script + committed generated `.d.ts` + consumer type-level proof)

### transpiler-pipeline
- **Status**: planned
- **Why**: The output Lua must match what Defold's runtime expects (no `require` shim assumptions that break, correct module shape, source maps that the editor can use).
- **What**:
  - Wraps `typescript-to-lua` with Defold-specific transforms
  - Emits one Lua file per Defold script component (`.script`, `.gui_script`, `.render_script`)
  - Source maps preserved
  - Incremental rebuild under 200 ms for single-file edits
- **Depends on**: types-api-coverage
- **Impl**: (none yet)

### cli-scaffold
- **Status**: planned
- **Why**: New users need a one-command path from "I have Bun" to "my Defold project compiles TS to Lua on save." Existing Defold projects need the same path without overwriting their `game.project`, collections, or scripts.
- **What**:
  - `bunx defold-ts init [path]` decides between two modes based on what already exists at `path`:
    - **Scaffold a new project** when `path` is empty or missing — writes `game.project`, a starter collection, a sample `.script`, and the TS sources/types/build config.
    - **Add TS support to an existing project** when `game.project` (or other Defold project files) is detected — only writes the TypeScript surface (`src/`, `tsconfig.json`, `package.json` entries, `@defold-ts/types`, build config) and leaves existing Defold assets untouched.
  - Detection rule: presence of `game.project` at `path` (and absence of conflicting TS config) is the signal for "existing project." Document the rule so agents can reproduce the decision.
  - Conflict handling: if TS config already exists (`tsconfig.json`, `defold-ts.config.*`), abort with a clear message and a `--force` opt-in. Never silently overwrite user files.
  - `defold-ts build` and `defold-ts watch` work identically in both modes once init has run.
  - Works on macOS, Linux, Windows.
- **Depends on**: transpiler-pipeline
- **Impl**: (none yet)

### agent-support
- **Status**: planned
- **Why**: AI agents are first-class users of this toolchain. They need machine-readable conventions, a stable CLI surface, and per-task instructions checked into the repo so any clanker can drive it without bespoke prompting.
- **What**:
  - `AGENTS.md` (or equivalent) at repo and package level documenting conventions
  - CLI commands emit structured (JSON) output behind a `--json` flag
  - Skills/commands for the most common agent workflows: scaffold, regen types, add script, fix Lua output
  - Example agent runbooks under `docs/`
- **Depends on**: cli-scaffold
- **Impl**: (none yet)

### test-harness
- **Status**: planned
- **Why**: Bun's test runner is the speed lever; we want sub-second feedback on transpiler output diffs and type-coverage regressions.
- **What**:
  - `bun test` as the only test command
  - Snapshot tests for representative TS-to-Lua outputs
  - Type-level tests using `expect-type` or equivalent for the types package
  - CI runs the whole suite in under 30 s on a cold checkout
- **Depends on**: none
- **Impl**: (none yet)
