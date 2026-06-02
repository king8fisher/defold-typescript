# Add TypeScript to an existing Defold project

Use `defold-typescript init` inside a Defold project that already has `game.project`.

```sh
cd my-existing-defold-game
bunx defold-typescript init
```

When `game.project` exists, `init` does not synthesize a new Defold project. It only writes the TypeScript surface:

- `src/main.ts`
- `tsconfig.json`
- `package.json`

If `package.json` already exists, the command preserves its existing fields and merges these dev dependencies when they are missing:

- `@defold-typescript/transpiler`
- `@defold-typescript/types`

If `package.json` does not exist, the command creates one.

## Conflicting config files

`init` refuses to overwrite an existing TypeScript or defold-typescript config. Remove or move the conflicting file before running the command.

Conflicts today are:

- `tsconfig.json`
- `defold-typescript.config.ts`
- `defold-typescript.config.mts`
- `defold-typescript.config.js`

Pass `--force` to overwrite a conflicting TS config (in new-project mode, `--force` also lets `init` synthesize into a non-empty directory). `--force` overwrites the config wholesale; it does not merge fields, so any settings you had in `tsconfig.json` are replaced by the scaffold config.

## Build the Lua output

After initialization, write TypeScript under `src/` and run:

```sh
bunx defold-typescript build
```

The default `tsconfig.json` type-checks against `@defold-typescript/types` and writes Lua next to each `.ts` source (`src/main.ts` -> `src/main.lua`). The scaffold also drops a `.gitignore` so the generated `.lua`/`.lua.map` files stay out of version control. Set a concrete `outDir` to collect Lua under a separate tree instead.
