import { DEFOLD_TYPE_MAP } from "./core-types";

export interface MessageField {
  name: string;
  types: string[];
  optional: boolean;
  doc: string;
}

export interface MessageEntry {
  name: string;
  origin: string;
  description: string;
  payload: MessageField[];
}

export interface MessageCatalog {
  entries: MessageEntry[];
}

const TS_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const ENGINE_TYPES = [
  "Hash",
  "Matrix4",
  "Quaternion",
  "Url",
  "Vector",
  "Vector3",
  "Vector4",
] as const;

export function parseMessagesDoc(raw: unknown): MessageCatalog {
  if (!isRecord(raw)) {
    throw new Error(`parseMessagesDoc: expected object, got ${describeKind(raw)}`);
  }
  const rawMessages = raw.messages;
  if (!Array.isArray(rawMessages)) {
    throw new Error(`parseMessagesDoc: missing or invalid "messages" array`);
  }
  const entries: MessageEntry[] = [];
  for (const item of rawMessages) {
    if (!isRecord(item)) continue;
    const name = stringOr(item.name, "");
    if (name === "") continue;
    entries.push({
      name,
      origin: stringOr(item.origin, ""),
      description: stringOr(item.description, ""),
      payload: parsePayload(item.payload),
    });
  }
  return { entries };
}

function parsePayload(raw: unknown): MessageField[] {
  if (!Array.isArray(raw)) return [];
  const fields: MessageField[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const name = stringOr(item.name, "");
    if (name === "") continue;
    const typesRaw = item.types;
    const types = Array.isArray(typesRaw)
      ? typesRaw.filter((t): t is string => typeof t === "string")
      : [];
    fields.push({
      name,
      types,
      optional: item.optional === true,
      doc: stringOr(item.doc, ""),
    });
  }
  return fields;
}

export function emitBuiltinMessages(catalog: MessageCatalog): string {
  const entries = [...catalog.entries].sort((a, b) => a.name.localeCompare(b.name));
  const body = entries.map(emitEntry).join("\n");
  const inner = [
    "declare global {",
    "  interface BuiltinMessages {",
    body,
    "  }",
    "  type BuiltinMessageId = keyof BuiltinMessages;",
    "}",
    "",
    "export {};",
    "",
  ].join("\n");
  const used = collectEngineTypes(inner);
  const importLine =
    used.length === 0 ? "" : `import type { ${used.join(", ")} } from "../src/core-types";\n\n`;
  return `${importLine}${inner}`;
}

function emitEntry(entry: MessageEntry): string {
  const key = TS_IDENTIFIER.test(entry.name) ? entry.name : JSON.stringify(entry.name);
  if (entry.payload.length === 0) {
    return `    ${key}: Record<string, never>;`;
  }
  const fields = entry.payload.map(emitField).join("; ");
  return `    ${key}: { ${fields} };`;
}

function emitField(field: MessageField): string {
  const name = TS_IDENTIFIER.test(field.name) ? field.name : JSON.stringify(field.name);
  const optional = field.optional ? "?" : "";
  const ts = field.types.length === 0 ? "unknown" : unionFromTokens(field.types);
  return `${name}${optional}: ${ts}`;
}

function unionFromTokens(tokens: readonly string[]): string {
  const seen = new Set<string>();
  const mapped: string[] = [];
  for (const token of tokens) {
    const ts = mapToken(token);
    if (seen.has(ts)) continue;
    seen.add(ts);
    mapped.push(ts);
  }
  return mapped.join(" | ");
}

function mapToken(token: string): string {
  if (Object.hasOwn(DEFOLD_TYPE_MAP, token)) {
    const mapped = DEFOLD_TYPE_MAP[token];
    if (typeof mapped === "string") return mapped;
  }
  return token;
}

function collectEngineTypes(emitted: string): string[] {
  return ENGINE_TYPES.filter((t) => new RegExp(`\\b${t}\\b`).test(emitted));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function describeKind(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}
