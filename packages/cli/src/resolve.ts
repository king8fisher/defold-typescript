// The user-facing orchestration slice of the `[dependencies]`-driven extension
// typing pipeline. `runResolve` joins the five prior pure slices end to end:
// `readExtensionDependencies` (game.project -> URLs), `resolveExtensionDeclarations`
// (download/cache each archive -> one emitted bundle per dependency),
// `materializeExtensionDeclarations` (write the bundles into
// `.defold-types/extensions/`), and `ensureExtensionTypesReference` (point tsconfig
// at the sibling surface). The CLI `resolve` verb in dispatch.ts drives this; the
// download/readZip/cacheDir seams stay injectable so the orchestration is
// network-free under test.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type DownloadExtensionArchive,
  type ExtensionArchiveProvenance,
  extensionCacheDir,
  type ReadExtensionZip,
} from "./extension-archive";
import { resolveExtensionDeclarations } from "./extension-declarations";
import { readExtensionDependencies } from "./extension-deps";
import {
  ensureExtensionTypesReference,
  materializeExtensionDeclarations,
} from "./extension-materialize";

export interface ResolvedExtensionReport {
  readonly url: string;
  readonly provenance: ExtensionArchiveProvenance;
  readonly namespaces: string[];
  readonly scriptApiCount: number;
  readonly assetOnly: boolean;
}

export interface RunResolveOptions {
  readonly cwd: string;
  readonly cacheDir?: string;
  readonly download?: DownloadExtensionArchive;
  readonly readZip?: ReadExtensionZip;
}

export interface RunResolveResult {
  readonly ok: boolean;
  readonly error?: string;
  readonly materializedSurface: string | null;
  readonly extensions: ResolvedExtensionReport[];
}

function hasProjectSection(text: string): boolean {
  return text.split("\n").some((line) => line.trim() === "[project]");
}

export async function runResolve(opts: RunResolveOptions): Promise<RunResolveResult> {
  const { cwd } = opts;
  const gameProjectPath = join(cwd, "game.project");
  if (!existsSync(gameProjectPath)) {
    return {
      ok: false,
      error: `no game.project found in ${cwd}`,
      materializedSurface: null,
      extensions: [],
    };
  }

  const text = readFileSync(gameProjectPath, "utf8");
  if (!hasProjectSection(text)) {
    return {
      ok: false,
      error: "game.project has no [project] section",
      materializedSurface: null,
      extensions: [],
    };
  }

  const deps = readExtensionDependencies(text);
  if (deps.length === 0) {
    return { ok: true, materializedSurface: null, extensions: [] };
  }

  const bundles = await resolveExtensionDeclarations(deps, {
    cacheDir: opts.cacheDir ?? extensionCacheDir(),
    ...(opts.download ? { download: opts.download } : {}),
    ...(opts.readZip ? { readZip: opts.readZip } : {}),
  });

  const { materializedDir } = materializeExtensionDeclarations({ cwd, bundles });
  ensureExtensionTypesReference(cwd, materializedDir);

  const extensions: ResolvedExtensionReport[] = bundles.map((bundle) => ({
    url: bundle.url,
    provenance: bundle.provenance,
    namespaces: bundle.declarations.map((d) => d.namespace).sort(),
    scriptApiCount: bundle.declarations.length,
    assetOnly: bundle.assetOnly,
  }));

  return { ok: true, materializedSurface: materializedDir, extensions };
}
