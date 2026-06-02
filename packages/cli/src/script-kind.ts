import { scanFilesSync } from "./scan";

export type ScriptKind = "script" | "gui-script" | "render-script";

export const DEFAULT_TYPES_ENTRYPOINT = "@defold-typescript/types";

const KIND_BY_EXT: Record<string, ScriptKind> = {
  ".script": "script",
  ".gui_script": "gui-script",
  ".render_script": "render-script",
};

const SKIP_SEGMENTS = new Set(["node_modules", ".defold-types", "build"]);

export function isSkipped(relPath: string): boolean {
  return relPath.split(/[/\\]/).some((segment) => SKIP_SEGMENTS.has(segment));
}

export function isComponentPath(relPath: string): boolean {
  return Object.keys(KIND_BY_EXT).some((ext) => relPath.endsWith(ext));
}

export function detectScriptKinds(cwd: string): Set<ScriptKind> {
  const kinds = new Set<ScriptKind>();
  for (const [ext, kind] of Object.entries(KIND_BY_EXT)) {
    for (const match of scanFilesSync(cwd, `**/*${ext}`)) {
      if (!isSkipped(match)) {
        kinds.add(kind);
        break;
      }
    }
  }
  return kinds;
}

export function selectScriptKind(kinds: Set<ScriptKind>): ScriptKind | null {
  if (kinds.size !== 1) {
    return null;
  }
  for (const kind of kinds) {
    return kind;
  }
  return null;
}

export function selectScriptKindEntrypoint(kinds: Set<ScriptKind>): string {
  const kind = selectScriptKind(kinds);
  return kind === null ? DEFAULT_TYPES_ENTRYPOINT : `${DEFAULT_TYPES_ENTRYPOINT}/${kind}`;
}

// The one restricted namespace each kind allows; mirrors `regen.ts`'s
// RESTRICTED_NAMESPACES (gui -> gui_script, render -> render_script). `script`
// allows neither.
const RESTRICTED_MODULES: Record<ScriptKind, string> = {
  script: "",
  "gui-script": "gui",
  "render-script": "render",
};

const ALL_RESTRICTED_MODULES: readonly string[] = ["gui", "render"];

export function excludedModulesForKind(kind: ScriptKind | null): Set<string> {
  if (kind === null) {
    return new Set();
  }
  const allowed = RESTRICTED_MODULES[kind];
  return new Set(ALL_RESTRICTED_MODULES.filter((mod) => mod !== allowed));
}
