# Code editor setup

Open the Defold project folder in VSCode or any editor with TypeScript support. Use the folder that contains `game.project`, `src/`, and `tsconfig.json`.

## What `tsconfig.json` provides

The generated `tsconfig.json` sets:

- `types: ["@defold-typescript/types"]` so Defold globals such as `vmath`, `msg`, and `print` type-check in `src/*.ts`.
- no `outDir`, so transpiled Lua lands next to its `.ts` source (`src/main.ts` -> `src/main.lua`) for Defold to load. Set a concrete `outDir` to collect Lua under a separate tree instead.
- `strict: true` so project code gets normal TypeScript checks.

VSCode's built-in TypeScript support reads this file automatically when the project folder is open.

## Recommended editor extensions

- TypeScript support: built into VSCode.
- Lua or Defold extensions: optional, useful when inspecting generated Lua or Defold resources.

Edit TypeScript under `src/`. Treat the generated `.lua` and `.lua.map` files next to your sources as build output; the scaffolded `.gitignore` keeps them out of version control.

## Run the watch loop

Keep Defold open on the same project folder. In the editor's integrated terminal, run:

```sh
bunx @defold-typescript/cli watch
```

`defold-typescript watch` rebuilds Lua when files under `src/` change. Run the game from the Defold editor after the rebuild completes.
