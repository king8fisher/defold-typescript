import { parse } from "yaml";

export interface RefDocParameter {
  name: string;
  doc: string;
  types: string[];
}

export interface RefDocElement {
  type: "FUNCTION";
  name: string;
  description: string;
  parameters: RefDocParameter[];
  returnvalues: RefDocParameter[];
}

export interface RefDoc {
  info: { namespace: string; brief: string; description: string };
  elements: RefDocElement[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function mapParameters(raw: unknown): RefDocParameter[] {
  if (!Array.isArray(raw)) return [];
  const out: RefDocParameter[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const name = stringOr(item.name, "");
    // The script_api lists the implicit `self` the engine passes; the emitter
    // stamps @noSelfInFile, so generated signatures must not declare it.
    if (name === "self") continue;
    const type = item.type;
    out.push({
      name,
      doc: stringOr(item.desc, ""),
      types: typeof type === "string" ? [type] : [],
    });
  }
  return out;
}

/**
 * Convert a parsed Defold extension `.script_api` document into the core
 * ref-doc JSON object shape that `parseDefoldApiDoc` consumes. Only
 * `type: function` members are carried; scalar members (constants) are
 * dropped, matching the core ref-doc pipeline where non-function elements
 * never reach the emitter.
 */
export function scriptApiToRefDoc(parsed: unknown): RefDoc {
  if (!Array.isArray(parsed)) {
    throw new Error("scriptApiToRefDoc: expected a top-level YAML list");
  }
  const tables = parsed.filter(
    (e): e is Record<string, unknown> => isRecord(e) && e.type === "table",
  );
  if (tables.length === 0) {
    throw new Error("scriptApiToRefDoc: no top-level `type: table` namespace entry found");
  }
  if (tables.length > 1) {
    throw new Error("scriptApiToRefDoc: expected exactly one top-level table, found multiple");
  }
  const table = tables[0] as Record<string, unknown>;
  const namespace = stringOr(table.name, "");
  if (namespace.length === 0) {
    throw new Error("scriptApiToRefDoc: top-level table is missing a `name`");
  }
  const members = Array.isArray(table.members) ? table.members : [];
  const elements: RefDocElement[] = [];
  for (const member of members) {
    if (!isRecord(member) || member.type !== "function") continue;
    elements.push({
      type: "FUNCTION",
      name: `${namespace}.${stringOr(member.name, "")}`,
      description: stringOr(member.desc, ""),
      parameters: mapParameters(member.parameters),
      returnvalues: mapParameters(member.returns),
    });
  }
  const doc: RefDoc = {
    info: { namespace, brief: stringOr(table.desc, ""), description: stringOr(table.desc, "") },
    elements,
  };
  return doc;
}

export function parseScriptApi(yamlText: string): RefDoc {
  return scriptApiToRefDoc(parse(yamlText));
}
