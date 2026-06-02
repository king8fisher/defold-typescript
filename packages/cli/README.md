# defold-typescript

The end-user CLI for scaffolding and building [Defold](https://defold.com/)
projects written in TypeScript, transpiled to Lua.

```sh
bunx @defold-typescript/cli init    # add TypeScript to a Defold project, or scaffold a new one
bunx @defold-typescript/cli build   # transpile src/ to Lua alongside your Defold sources
bunx @defold-typescript/cli watch   # rebuild on change
```

The package name is scoped (`@defold-typescript/cli`); `bunx defold-typescript`
without the scope resolves a different, nonexistent package. Install it to get
the shorter `defold-typescript` binary on your `PATH` and pin the version:

```sh
npm i -D @defold-typescript/cli   # then: bunx defold-typescript <command>
```

See the repository [README](https://github.com/king8fisher/defold-typescript#readme)
and [`docs/guide/`](https://github.com/king8fisher/defold-typescript/tree/main/docs/guide)
for the full workflow.

## License

MIT
