# Agent guide

This repo is designed to be driven by AI agents (clankers) as well as humans. Treat this file as the contract.

## Ground rules

- Use Bun for everything: install, run, test. Never invoke `npm` or `node` directly.
- Lint and format with Biome (`bun run lint`, `bun run lint:fix`). Do not introduce ESLint or Prettier.
- Do not add comments unless the *why* is non-obvious. Names should carry intent.
- Never commit without an explicit human request, unless the active skill workflow calls for it.

## Planning loop

The whole project is planned and executed through three skills:

1. `/next-step` — surveys unplanned goals in `docs/prd/` and picks the next one.
2. `/plan-step` — adds a requirement to `docs/prd/` and a TDD-ready step to `docs/impl/`.
3. `/implement-step` — executes the next step from `docs/impl/`, test-first.

If you are an agent and uncertain what to do, run `/next-step` first.

## Layout invariants

- `packages/types` — typings only, no runtime code.
- `packages/transpiler` — depends on `@defold-ts/types`; produces Lua output.
- `packages/cli` — the only package that exposes a binary (`defold-ts`).
- New packages go under `packages/`; do not create siblings at the repo root.

## Testing

- `bun test` runs the full suite from the repo root.
- Co-locate unit tests next to the source: `foo.ts` ↔ `foo.test.ts`.
- Snapshot transpiler output for representative inputs; do not assert on Lua substrings.
