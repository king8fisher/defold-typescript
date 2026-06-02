import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  type ApiTarget,
  generateModuleDeclaration,
  generateVersionIndex,
  type ResolveTargetOptions,
  resolveTargetModules,
} from "./regen";

export interface MaterializeVersionedSurfaceOptions {
  readonly destDir: string;
  readonly resolveOpts?: ResolveTargetOptions;
  // Bare module names (no `.d.ts`) to omit from the surface — both the emitted
  // file and its aggregate-index import. Lets a caller narrow the surface to a
  // script kind without the generator knowing what a script kind is.
  readonly excludeModules?: readonly string[];
}

// Generate a versioned surface on the fly into a project-local faux `@types`
// package: resolve the target's module docs (ref-doc or committed fixture),
// emit each module declaration, then write the aggregate side-effect entrypoint
// and a minimal package.json. ref-doc targets are never pre-baked, so this is
// the only path that turns a resolved version into a consumable type surface.
export async function materializeVersionedSurface(
  target: ApiTarget,
  opts: MaterializeVersionedSurfaceOptions,
): Promise<void> {
  const exclude = new Set(opts.excludeModules ?? []);
  const modules = (await resolveTargetModules(target, opts.resolveOpts ?? {})).filter(
    (entry) => !exclude.has(entry.outFile.replace(/\.d\.ts$/, "")),
  );
  mkdirSync(opts.destDir, { recursive: true });

  for (const entry of modules) {
    const { contents } = generateModuleDeclaration(entry);
    writeFileSync(resolve(opts.destDir, entry.outFile), contents);
  }

  const versioned = modules.map((entry) => ({ ...entry, versionId: target.id }));
  writeFileSync(resolve(opts.destDir, "index.d.ts"), generateVersionIndex(target.id, versioned));

  writeFileSync(
    resolve(opts.destDir, "package.json"),
    `${JSON.stringify(
      { name: `@defold-typescript/materialized-${target.id}`, types: "index.d.ts" },
      null,
      2,
    )}\n`,
  );
}
