import { globSync, statSync } from "node:fs";
import * as path from "node:path";

// `Bun.Glob` is undefined when the published bin runs under plain node, so the
// scaffold/build path must use the cross-runtime `node:fs` glob instead. Bun's
// `globSync` does not support `withFileTypes`, so directories are filtered out
// with a stat to preserve the original `onlyFiles` contract.
export function scanFilesSync(cwd: string, pattern: string): string[] {
  return globSync(pattern, { cwd }).filter((rel) => statSync(path.join(cwd, rel)).isFile());
}
