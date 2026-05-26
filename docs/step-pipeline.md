# Step pipeline

Resolves the commands the `next-step → plan-step → implement-step` skills use to run CI, tests, and lint.

## Commands

- **ci**:
  1. `bun run typecheck` — type-check every workspace via `tsc --noEmit`
  2. `bun run lint` — Biome check (errors and warnings both fail)
  3. `bun test --pass-with-no-tests` — run the full Bun test suite (tolerates the pre-first-test bootstrap state; any test that exists must still pass)
- **test**: `bun test` — run all tests
- **test-file**: `bun test <file>` — run a single test file
- **lint**: `bun run lint` — `biome check .`
- **format**: `bun run lint:fix` — `biome check --write .`
- **build**: `bun run build` — build every workspace
