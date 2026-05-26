# defold-typescript

TypeScript for [Defold](https://defold.com/), transpiled to Lua. A modern, agent-friendly successor to the [ts-defold](https://github.com/ts-defold) family of repositories.

## Why a new project

[ts-defold](https://github.com/ts-defold) — by [@thinginitself](https://github.com/thinginitself) and contributors — proved that authoring Defold games in TypeScript is viable. This repo restarts that effort with a tighter, monorepo-first layout so we can:

- **Add agent (clanker) support** — first-class instructions and tooling for AI agents driving the toolchain, type generation, and game code.
- **Move faster** — single repo, single test runner, single dependency graph. No coordination across five repos to ship one change.
- **Modernize the toolchain** — Bun as runtime, package manager, and test runner; ESM throughout; TypeScript 5.x with strict settings.
- **Lint with Biome** — replace the ESLint + Prettier combo with a single fast tool.
- **Speed up testing** — Bun's built-in test runner instead of Jest/Mocha; co-located unit tests with millisecond-level feedback.

Credit to the original ts-defold maintainers; this project stands on their work and the broader [TypeScriptToLua](https://github.com/TypeScriptToLua/TypeScriptToLua) ecosystem.

## Repository layout

```
defold-typescript/
├── packages/
│   ├── types/        Defold API typings (script lifecycle, message system, GUI, etc.)
│   ├── transpiler/   TS-to-Lua build pipeline tuned for Defold's runtime
│   └── cli/          End-user CLI: scaffold, build, watch
├── docs/
│   ├── prd/          Product Requirements — vision and per-goal specs
│   └── impl/         Implementation steps — TDD-ready, one file per step
└── biome.json, tsconfig.json, package.json (workspace root)
```

## Prerequisites

- [Bun](https://bun.sh/) `>= 1.3`
- Defold editor (for running the resulting games)

## Getting started

```sh
bun install
bun run lint
bun test
```

## Planning workflow

Planning lives in `docs/`. Three skills drive it end-to-end:

- `/next-step` — surveys unplanned goals in `docs/prd/` and picks the next one
- `/plan-step` — adds a requirement to `docs/prd/` and a TDD-ready implementation step to `docs/impl/`
- `/implement-step` — executes the next step from `docs/impl/` test-first

See [docs/prd/README.md](docs/prd/README.md) and [docs/impl/README.md](docs/impl/README.md) for the conventions.

## License

TBD — will mirror or be compatible with the original ts-defold licensing.

## Acknowledgements

- [ts-defold](https://github.com/ts-defold) — the original project this repo aims to succeed
- [TypeScriptToLua](https://github.com/TypeScriptToLua/TypeScriptToLua) — the transpiler we build on
- [Defold](https://defold.com/) — the engine
