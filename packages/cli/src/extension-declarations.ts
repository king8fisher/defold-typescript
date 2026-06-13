// The bridge slice of the `[dependencies]`-driven extension typing pipeline: it
// joins the resolver (extension-archive.ts, URL -> located `.script_api` paths +
// provenance + cached archive) to the emitter (extension-emit.ts, one
// `.script_api` text -> ambient-namespace `.d.ts`). For each resolved extension it
// re-opens the cached archive, reads each located doc's bytes, and emits its
// declaration, returning one bundle per declared dependency. Asset-only deps carry
// an empty `declarations` list and are reported, not failed. Writing into
// `.defold-types/` and the CLI `resolve` verb stay later slices.

import {
  defaultReadZip,
  type ExtensionArchiveProvenance,
  type ResolveExtensionArchiveOptions,
  resolveExtensions,
} from "./extension-archive";
import type { ExtensionDependency } from "./extension-deps";
import { type EmittedExtension, emitExtensionDeclaration } from "./extension-emit";

export interface ExtensionDeclarations {
  readonly url: string;
  readonly provenance: ExtensionArchiveProvenance;
  readonly assetOnly: boolean;
  readonly resolvedVersion: string;
  readonly declarations: EmittedExtension[];
}

export async function resolveExtensionDeclarations(
  deps: readonly ExtensionDependency[],
  opts: ResolveExtensionArchiveOptions,
): Promise<ExtensionDeclarations[]> {
  const open = opts.readZip ?? defaultReadZip;
  const resolved = await resolveExtensions(deps, opts);

  const bundles: ExtensionDeclarations[] = [];
  for (const archive of resolved) {
    if (archive.assetOnly) {
      bundles.push({
        url: archive.url,
        provenance: archive.provenance,
        assetOnly: true,
        resolvedVersion: archive.resolvedVersion,
        declarations: [],
      });
      continue;
    }
    const zip = await open(archive.archivePath);
    const declarations: EmittedExtension[] = [];
    for (const scriptApi of archive.scriptApis) {
      declarations.push(await emitExtensionDeclaration(zip.read(scriptApi)));
    }
    bundles.push({
      url: archive.url,
      provenance: archive.provenance,
      assetOnly: false,
      resolvedVersion: archive.resolvedVersion,
      declarations,
    });
  }
  return bundles;
}
