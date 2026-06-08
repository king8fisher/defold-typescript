import { parseDefoldApiDoc } from "../src/api-doc";
import {
  type ApiTarget,
  loadApiTargets,
  type ResolveTargetOptions,
  resolveTargetModules,
} from "./regen";

export interface RefDocDeltaArgs {
  target: string;
  namespace: string;
  present: string[];
  absent: string[];
  json: boolean;
}

export interface RefDocDeltaReport {
  ok: boolean;
  targetId: string;
  version: string;
  namespace: string;
  provenance: string | null;
  missingPresent: string[];
  unexpectedPresent: string[];
}

export interface VerifyRefDocDeltaInput {
  target: ApiTarget;
  namespace: string;
  present: readonly string[];
  absent: readonly string[];
  resolveOpts?: ResolveTargetOptions;
}

export function collectElementNames(doc: unknown): Set<string> {
  const module = parseDefoldApiDoc(doc);
  const names = new Set<string>([module.namespace]);
  for (const collection of [
    module.functions,
    module.constants,
    module.variables,
    module.properties,
  ]) {
    for (const item of collection) {
      if (item.name.length > 0) names.add(item.name);
    }
  }
  return names;
}

export function parseRefDocDeltaArgs(argv: readonly string[]): RefDocDeltaArgs {
  const args: RefDocDeltaArgs = { target: "", namespace: "", present: [], absent: [], json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") {
      args.json = true;
      continue;
    }
    if (arg === "--target" || arg === "--namespace" || arg === "--present" || arg === "--absent") {
      const value = argv[++i];
      if (!value) throw new Error(`${arg} requires a value`);
      if (arg === "--target") args.target = value;
      else if (arg === "--namespace") args.namespace = value;
      else if (arg === "--present") args.present.push(value);
      else args.absent.push(value);
      continue;
    }
    throw new Error(`unknown argument: ${arg}`);
  }
  if (!args.target) throw new Error("--target is required");
  if (!args.namespace) throw new Error("--namespace is required");
  if (args.present.length === 0 && args.absent.length === 0) {
    throw new Error("at least one --present or --absent assertion is required");
  }
  return args;
}

export function selectRefDocDeltaTarget(
  targets: readonly ApiTarget[],
  targetId: string,
): ApiTarget {
  const target = targets.find((item) => item.id === targetId);
  if (!target) throw new Error(`target "${targetId}" not found`);
  if ((target.source ?? null)?.kind !== "ref-doc") {
    throw new Error(`target "${targetId}" is not ref-doc sourced`);
  }
  return target;
}

export async function verifyRefDocDelta(input: VerifyRefDocDeltaInput): Promise<RefDocDeltaReport> {
  const source = input.target.source ?? null;
  if (source?.kind !== "ref-doc") {
    throw new Error(`target "${input.target.id}" is not ref-doc sourced`);
  }
  const modules = await resolveTargetModules(input.target, input.resolveOpts);
  const module = modules.find((entry) => entry.namespace === input.namespace);
  if (!module) {
    throw new Error(`target "${input.target.id}" has no namespace "${input.namespace}"`);
  }
  const names = collectElementNames(module.doc);
  const missingPresent = input.present.filter((name) => !names.has(name));
  const unexpectedPresent = input.absent.filter((name) => names.has(name));
  return {
    ok: missingPresent.length === 0 && unexpectedPresent.length === 0,
    targetId: input.target.id,
    version: source.version,
    namespace: input.namespace,
    provenance: module.sourceProvenance ?? null,
    missingPresent,
    unexpectedPresent,
  };
}

function renderPlainReport(report: RefDocDeltaReport): string {
  const lines = [
    `${report.ok ? "ok" : "drift"}: ${report.targetId}/${report.namespace} (${report.version}, ${report.provenance ?? "unknown"})`,
  ];
  if (report.missingPresent.length > 0) {
    lines.push(`missing expected present: ${report.missingPresent.join(", ")}`);
  }
  if (report.unexpectedPresent.length > 0) {
    lines.push(`unexpected expected absent: ${report.unexpectedPresent.join(", ")}`);
  }
  return lines.join("\n");
}

if (import.meta.main) {
  try {
    const args = parseRefDocDeltaArgs(process.argv.slice(2));
    const target = selectRefDocDeltaTarget(loadApiTargets(), args.target);
    const report = await verifyRefDocDelta({
      target,
      namespace: args.namespace,
      present: args.present,
      absent: args.absent,
    });
    console.log(args.json ? JSON.stringify(report, null, 2) : renderPlainReport(report));
    if (!report.ok) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
