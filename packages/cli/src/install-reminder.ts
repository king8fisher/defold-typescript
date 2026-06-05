// The runner (`bunx`/`npx`/`pnpm dlx`/`yarn dlx`) sets `npm_config_user_agent`
// with the manager as its first token; when the bin is run directly the var is
// unset. A wrong guess only mis-advises — it never writes a lockfile — so the
// fallback to bun (the repo's primary manager) is safe.
export function installHint(env: NodeJS.ProcessEnv = process.env): string {
  const agent = env.npm_config_user_agent ?? "";
  const manager = agent.split("/")[0];
  if (manager === "pnpm") {
    return "pnpm install";
  }
  if (manager === "yarn") {
    return "yarn install";
  }
  if (manager === "npm") {
    return "npm install";
  }
  return "bun install";
}
