# Defold editor

Install the Defold editor from [defold.com](https://defold.com/). The editor is the engine UI you use to open the project folder, inspect assets, and run the game.

## Open the project

1. Start Defold.
2. Choose **Open Project**.
3. Select the folder that contains `game.project`.

For a project created with `bunx defold-typescript init`, that is the same folder where you run the CLI commands.

## Build before running

Run the TypeScript build before launching the game:

```sh
bunx defold-typescript build
```

By default the scaffolded `tsconfig.json` has no `outDir`, so transpiled Lua lands next to its `.ts` source (`src/main.ts` -> `src/main.lua`). Defold loads the Lua output from the project tree; keep it up to date with `build` or `watch` while you work. Set a concrete `outDir` if you prefer the Lua collected under a separate tree.

## Run the game

With the project open in Defold, press **Build** or **Project > Build** to run the game. If you change TypeScript code, rebuild with `defold-typescript` before running again, or keep `watch` running in a terminal.
