// Pure resolver core for the `[dependencies]`-driven extension typing pipeline.
// Generalises the read half of `addLldebuggerDependency` (setup-debug.ts): it
// walks `game.project` for every `dependencies#N` under `[project]` instead of
// only finding the max index to append one. Archive download/cache and the
// `.script_api`->ambient-namespace emit are later slices; the archive-location
// half stays pure by taking an already-listed set of entry paths.

export interface ExtensionDependency {
  readonly index: number;
  readonly url: string;
}

function isProjectHeader(line: string): boolean {
  return line.trim() === "[project]";
}

function isSectionHeader(line: string): boolean {
  return /^\[.+\]\s*$/.test(line.trim());
}

export function readExtensionDependencies(gameProjectText: string): ExtensionDependency[] {
  const lines = gameProjectText.split("\n");
  const deps: ExtensionDependency[] = [];
  let inProject = false;
  for (const line of lines) {
    if (isSectionHeader(line)) {
      inProject = isProjectHeader(line);
      continue;
    }
    if (!inProject) {
      continue;
    }
    const match = line.match(/^dependencies#(\d+)\s*=\s*(.+)$/);
    if (match?.[1] !== undefined && match[2] !== undefined) {
      deps.push({ index: Number(match[1]), url: match[2] });
    }
  }
  return deps;
}

export function locateScriptApis(entryPaths: readonly string[]): string[] {
  return entryPaths.filter((entry) => /\.script_api$/i.test(entry)).sort();
}

export interface ResolvedExtension {
  readonly url: string;
  readonly scriptApis: string[];
  readonly assetOnly: boolean;
}

export function classifyExtension(url: string, entryPaths: readonly string[]): ResolvedExtension {
  const scriptApis = locateScriptApis(entryPaths);
  return { url, scriptApis, assetOnly: scriptApis.length === 0 };
}
