import type { ApiFunction, ApiModule, ApiParameter, ApiVariable } from "./api-doc";
import { DEFOLD_TYPE_MAP } from "./core-types";

export interface EmitOptions {
  mapType?: (defoldType: string) => string;
}

const TS_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const INDENT = "  ";

export function emitDeclarations(module: ApiModule, options?: EmitOptions): string {
  const mapType = options?.mapType ?? defaultMapType;
  const prefix = `${module.namespace}.`;

  const variables = module.variables
    .map((v) => prepareVariable(v, prefix))
    .filter((entry): entry is PreparedVariable => entry !== null)
    .sort((a, b) => a.name.localeCompare(b.name));

  const functions = module.functions
    .map((fn) => prepareFunction(fn, prefix))
    .filter((entry): entry is PreparedFunction => entry !== null)
    .sort((a, b) =>
      a.name === b.name
        ? a.original.parameters.length - b.original.parameters.length
        : a.name.localeCompare(b.name),
    );

  const lines: string[] = [];
  lines.push(`declare namespace ${module.namespace} {`);

  for (const v of variables) {
    const line = emitVariable(v, mapType);
    if (line !== null) lines.push(`${INDENT}${line}`);
  }
  for (const fn of functions) {
    const line = emitFunction(fn, mapType);
    lines.push(`${INDENT}${line}`);
  }

  lines.push("}");
  return `${lines.join("\n")}\n`;
}

interface PreparedFunction {
  name: string;
  original: ApiFunction;
}

interface PreparedVariable {
  name: string;
  original: ApiVariable;
}

function prepareFunction(fn: ApiFunction, prefix: string): PreparedFunction | null {
  const stripped = stripPrefix(fn.name, prefix);
  if (!TS_IDENTIFIER.test(stripped)) return null;
  return { name: stripped, original: fn };
}

function prepareVariable(v: ApiVariable, prefix: string): PreparedVariable | null {
  const stripped = stripPrefix(v.name, prefix);
  if (!TS_IDENTIFIER.test(stripped)) return null;
  return { name: stripped, original: v };
}

function stripPrefix(name: string, prefix: string): string {
  return name.startsWith(prefix) ? name.slice(prefix.length) : name;
}

function emitVariable(prepared: PreparedVariable, mapType: (t: string) => string): string {
  const ts =
    prepared.original.types.length > 0
      ? unionFromTokens(prepared.original.types, mapType)
      : "unknown";
  return `const ${prepared.name}: ${ts};`;
}

function emitFunction(prepared: PreparedFunction, mapType: (t: string) => string): string {
  const params = prepared.original.parameters
    .map((p, i) => emitParameter(p, i, mapType))
    .join(", ");
  const ret = emitReturn(prepared.original.returnValues, mapType);
  return `function ${prepared.name}(${params}): ${ret.type};${ret.trailing}`;
}

function emitParameter(p: ApiParameter, index: number, mapType: (t: string) => string): string {
  const name = TS_IDENTIFIER.test(p.name) ? p.name : `arg${index}`;
  const ts = p.types.length > 0 ? unionFromTokens(p.types, mapType) : "unknown";
  return `${name}: ${ts}`;
}

function emitReturn(
  returnValues: ApiParameter[],
  mapType: (t: string) => string,
): { type: string; trailing: string } {
  if (returnValues.length === 0) return { type: "void", trailing: "" };
  const first = returnValues[0];
  if (!first) return { type: "void", trailing: "" };
  const ts = first.types.length > 0 ? unionFromTokens(first.types, mapType) : "unknown";
  const trailing = returnValues.length > 1 ? " // TODO multi-return" : "";
  return { type: ts, trailing };
}

function unionFromTokens(tokens: readonly string[], mapType: (t: string) => string): string {
  const mapped: string[] = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    const ts = mapType(token);
    if (seen.has(ts)) continue;
    seen.add(ts);
    mapped.push(ts);
  }
  return mapped.join(" | ");
}

function defaultMapType(token: string): string {
  if (Object.hasOwn(DEFOLD_TYPE_MAP, token)) {
    const mapped = DEFOLD_TYPE_MAP[token];
    if (typeof mapped === "string") return mapped;
  }
  return "unknown";
}
