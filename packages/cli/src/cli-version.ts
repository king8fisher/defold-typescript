import { readFileSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const VERSION_FALLBACK = "0.0.0";

// Anchor on the module URL, not `import.meta.dir` — the latter is a Bun-only
// property and is undefined when the bundled CLI runs under node (the `npx`
// path), which would silently anchor at the cwd. The bundled bin (`dist/bin.js`)
// and the in-repo `src/` loop both sit one level below the package root, so
// `package.json` is always `../package.json` from this module's directory. A
// missing or malformed manifest reports the fallback rather than throwing.
function defaultPackageRoot(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
}

export function readCliVersion(packageRoot: string = defaultPackageRoot()): string {
  try {
    const pkg = JSON.parse(readFileSync(path.join(packageRoot, "package.json"), "utf8")) as {
      version?: unknown;
    };
    return typeof pkg.version === "string" ? pkg.version : VERSION_FALLBACK;
  } catch {
    return VERSION_FALLBACK;
  }
}
