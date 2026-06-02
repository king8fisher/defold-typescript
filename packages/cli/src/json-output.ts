export type CliCommand = "init" | "build";

export interface RenderResultInput {
  readonly command: CliCommand;
  readonly written?: readonly string[];
  readonly error?: string;
  readonly defoldVersion?: string;
  readonly apiSurface?: string | null;
  readonly scriptKind?: string | null;
  readonly materializedSurface?: string | null;
}

export function renderResult(input: RenderResultInput): string {
  const ok = input.error === undefined;
  const base = ok
    ? { command: input.command, ok, written: input.written ?? [] }
    : { command: input.command, ok, error: input.error };
  const withVersion =
    input.defoldVersion === undefined ? base : { ...base, defoldVersion: input.defoldVersion };
  const withSurface =
    "apiSurface" in input ? { ...withVersion, apiSurface: input.apiSurface } : withVersion;
  const withScriptKind =
    "scriptKind" in input ? { ...withSurface, scriptKind: input.scriptKind } : withSurface;
  const payload =
    "materializedSurface" in input
      ? { ...withScriptKind, materializedSurface: input.materializedSurface }
      : withScriptKind;
  return `${JSON.stringify(payload)}\n`;
}
